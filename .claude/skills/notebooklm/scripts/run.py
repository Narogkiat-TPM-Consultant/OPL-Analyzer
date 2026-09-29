#!/usr/bin/env python3
"""
Universal runner for NotebookLM skill scripts
Ensures all scripts run with the correct virtual environment
"""

import os
import sys
import subprocess
import hashlib
from pathlib import Path


def get_venv_python():
    """Get the virtual environment Python executable"""
    skill_dir = Path(__file__).parent.parent
    venv_dir = skill_dir / ".venv"

    if os.name == 'nt':  # Windows
        venv_python = venv_dir / "Scripts" / "python.exe"
    else:  # Unix/Linux/Mac
        venv_python = venv_dir / "bin" / "python"

    return venv_python


def ensure_venv():
    """Set up an absent or incomplete virtual environment."""
    skill_dir = Path(__file__).parent.parent
    setup_script = skill_dir / "scripts" / "setup_environment.py"
    venv_python = get_venv_python()
    marker = skill_dir / ".venv" / ".setup-complete"
    requirements = skill_dir / "requirements.txt"
    requirements_hash = hashlib.sha256(requirements.read_bytes()).hexdigest()

    if not venv_python.is_file() or not marker.is_file() or marker.read_text() != requirements_hash:
        print("🔧 Setting up virtual environment...")
        print("   This may take a minute...")

        # Remove any previous success marker before a retry, including when the
        # interpreter has disappeared but requirements have not changed.
        marker.unlink(missing_ok=True)
        result = subprocess.run([sys.executable, str(setup_script)])
        if result.returncode != 0 or not venv_python.is_file():
            print("❌ Failed to set up environment")
            sys.exit(1)

        marker.write_text(requirements_hash)
        print("✅ Environment ready!")

    return venv_python


def main():
    """Main runner"""
    if len(sys.argv) < 2:
        print("Usage: python run.py <script_name> [args...]")
        print("\nAvailable scripts:")
        print("  ask_question.py    - Query NotebookLM")
        print("  notebook_manager.py - Manage notebook library")
        print("  session_manager.py  - Manage sessions")
        print("  auth_manager.py     - Handle authentication")
        print("  cleanup_manager.py  - Clean up skill data")
        sys.exit(1)

    script_name = sys.argv[1]
    script_args = sys.argv[2:]

    # Handle both "scripts/script.py" and "script.py" formats
    if script_name.startswith('scripts/'):
        # Remove the scripts/ prefix if provided
        script_name = script_name[8:]  # len('scripts/') = 8

    # Ensure .py extension
    if not script_name.endswith('.py'):
        script_name += '.py'

    # Get script path
    skill_dir = Path(__file__).parent.parent
    script_path = skill_dir / "scripts" / script_name

    if not script_path.exists():
        print(f"❌ Script not found: {script_name}")
        print(f"   Working directory: {Path.cwd()}")
        print(f"   Skill directory: {skill_dir}")
        print(f"   Looked for: {script_path}")
        sys.exit(1)

    # Ensure venv exists and get Python executable
    venv_python = ensure_venv()

    # Build command
    cmd = [str(venv_python), str(script_path)] + script_args

    # Run the script
    try:
        result = subprocess.run(cmd)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        print("\n⚠️ Interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
