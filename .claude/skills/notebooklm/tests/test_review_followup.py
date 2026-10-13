"""Regression checks for the review follow-up; no browser or network needed."""

import hashlib
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


SKILL_DIR = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("notebooklm_runner", SKILL_DIR / "scripts" / "run.py")
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
setup_spec = importlib.util.spec_from_file_location("notebooklm_setup", SKILL_DIR / "scripts" / "setup_environment.py")
setup_module = importlib.util.module_from_spec(setup_spec)
setup_spec.loader.exec_module(setup_module)


class RunnerSetupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.skill = Path(self.temp.name) / "notebooklm"
        (self.skill / "scripts").mkdir(parents=True)
        (self.skill / "requirements.txt").write_text("package==1\n")
        self.interpreter = self.skill / ".venv" / "bin" / "python"
        self.marker = self.skill / ".venv" / ".setup-complete"
        self.file_patch = patch.object(runner, "__file__", str(self.skill / "scripts" / "run.py"))
        self.file_patch.start()
        self.addCleanup(self.file_patch.stop)

    def setup_success(self, *_args, **_kwargs):
        self.interpreter.parent.mkdir(parents=True, exist_ok=True)
        self.interpreter.touch()
        return subprocess.CompletedProcess([], 0)

    def test_partial_venv_retries_and_then_skips_setup(self):
        self.interpreter.parent.mkdir(parents=True)
        self.interpreter.touch()  # venv exists, but dependency installation never finished
        with patch.object(runner.subprocess, "run", side_effect=self.setup_success) as setup:
            self.assertEqual(runner.ensure_venv(), self.interpreter)
            self.assertEqual(runner.ensure_venv(), self.interpreter)
            setup.assert_called_once()
        self.assertEqual(self.marker.read_text(), hashlib.sha256(b"package==1\n").hexdigest())

    def test_failed_setup_has_no_marker_and_retries(self):
        self.interpreter.parent.mkdir(parents=True)
        with patch.object(runner.subprocess, "run", return_value=subprocess.CompletedProcess([], 1)):
            with self.assertRaises(SystemExit):
                runner.ensure_venv()
        self.assertFalse(self.marker.exists())
        with patch.object(runner.subprocess, "run", side_effect=self.setup_success) as setup:
            runner.ensure_venv()
            setup.assert_called_once()

    def test_requirements_change_or_missing_interpreter_retries(self):
        with patch.object(runner.subprocess, "run", side_effect=self.setup_success) as setup:
            runner.ensure_venv()
            (self.skill / "requirements.txt").write_text("package==2\n")
            runner.ensure_venv()
            self.interpreter.unlink()
            runner.ensure_venv()
            self.assertEqual(setup.call_count, 3)

    def test_success_return_without_interpreter_is_not_complete(self):
        with patch.object(runner.subprocess, "run", return_value=subprocess.CompletedProcess([], 0)):
            with self.assertRaises(SystemExit):
                runner.ensure_venv()
        self.assertFalse(self.marker.exists())

    def run_activated_setup(self, marker_state, fail_install=False):
        self.interpreter.parent.mkdir(parents=True, exist_ok=True)
        self.interpreter.touch()
        pip = self.interpreter.with_name("pip")
        pip.touch()
        requirements = self.skill / "requirements.txt"
        requirements.write_text("package==2\n")
        if marker_state == "changed_requirements":
            self.marker.write_text(hashlib.sha256(b"package==1\n").hexdigest())
        else:
            self.marker.unlink(missing_ok=True)

        setup_script = self.skill / "scripts" / "setup_environment.py"
        commands = []

        def execute(command, **kwargs):
            commands.append(command)
            # Run the actual setup entry point rather than faking its success.
            # Only dependency/browser installation is mocked.
            if command == [str(self.interpreter), str(setup_script)]:
                with patch.object(sys, "argv", [str(setup_script)]):
                    return subprocess.CompletedProcess(command, setup_module.main() or 0)
            self.assertFalse(self.marker.exists(), "Marker must wait for installation")
            if fail_install and command == [str(pip), "install", "-r", str(requirements)]:
                raise subprocess.CalledProcessError(1, command)
            return subprocess.CompletedProcess(command, 0)

        with (
            patch.object(setup_module, "__file__", str(setup_script)),
            patch.object(sys, "executable", str(self.interpreter)),
            patch.object(sys, "prefix", str(self.skill / ".venv")),
            patch.object(sys, "base_prefix", str(self.skill / "base-python")),
            patch.object(runner.subprocess, "run", side_effect=execute),
            patch.object(setup_module.venv, "create") as create,
        ):
            self.assertTrue(setup_module.SkillEnvironment().is_in_skill_venv())
            if fail_install:
                with self.assertRaises(SystemExit) as failure:
                    runner.ensure_venv()
                self.assertEqual(failure.exception.code, 1)
                self.assertFalse(self.marker.exists())
                fail_install = False
                commands.clear()
            self.assertEqual(runner.ensure_venv(), self.interpreter)
            self.assertEqual(commands, [
                [str(self.interpreter), str(setup_script)],
                [str(pip), "install", "--upgrade", "pip"],
                [str(pip), "install", "-r", str(requirements)],
                [str(self.interpreter), "-m", "patchright", "install", "chrome"],
            ])
            self.assertEqual(self.marker.read_text(), hashlib.sha256(requirements.read_bytes()).hexdigest())
            commands.clear()
            self.assertEqual(runner.ensure_venv(), self.interpreter)
            self.assertEqual(commands, [])
            create.assert_not_called()

    def test_manual_activation_installs_before_recording_completion(self):
        for marker_state in ("changed_requirements", "missing_marker"):
            with self.subTest(marker_state=marker_state):
                self.run_activated_setup(marker_state)

    def test_manual_activation_failed_install_has_no_marker_and_retries(self):
        for marker_state in ("changed_requirements", "missing_marker"):
            with self.subTest(marker_state=marker_state):
                self.run_activated_setup(marker_state, fail_install=True)


class RecoveryDocumentationTests(unittest.TestCase):
    def test_manual_add_shell_continuation_passes_topics(self):
        guide = (SKILL_DIR / "SKILL.md").read_text()
        example = guide.split("# Add notebook to library (ALL parameters are REQUIRED!)", 1)[1]
        command = example.split("\n\n", 1)[0].split("\n", 1)[1]
        # Execute with a shell function in place of Python, so no setup or network runs.
        result = subprocess.run(
            ["bash", "-c", 'python() { printf "<%s>\\n" "$@"; }; ' + command],
            text=True, capture_output=True, check=True,
        )
        self.assertIn("<--topics>\n<topic1,topic2,topic3>", result.stdout)
        self.assertIn("<--description>\n<What this notebook contains>", result.stdout)

    def test_recovery_commands_use_wrapper_and_confirm(self):
        guide = (SKILL_DIR / "SKILL.md").read_text()
        question = (SKILL_DIR / "scripts" / "ask_question.py").read_text()
        self.assertIn("python scripts/run.py auth_manager.py setup", question)
        self.assertIn("python scripts/run.py cleanup_manager.py --preserve-library --confirm", guide)


class EnvironmentRepairTests(unittest.TestCase):
    def test_missing_interpreter_in_existing_venv_is_recreated(self):
        with tempfile.TemporaryDirectory() as directory:
            skill = Path(directory) / "notebooklm"
            (skill / ".venv").mkdir(parents=True)
            with patch.object(setup_module, "__file__", str(skill / "scripts" / "setup_environment.py")):
                environment = setup_module.SkillEnvironment()
                with patch.object(setup_module.venv, "create") as create:
                    self.assertTrue(environment.ensure_venv())
                    create.assert_called_once_with(environment.venv_dir, with_pip=True)


if __name__ == "__main__":
    unittest.main()
