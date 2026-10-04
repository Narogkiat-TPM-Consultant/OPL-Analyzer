// Three mini drives: loose / OK / tight (sag 36 / 12 / 0).
const g = H.beltGeom(85, 88, 48, 380, 66);
H.drive("s5-v-d1", "s5-v-b1", g, 36, "s5-v-1");
H.drive("s5-v-d2", "s5-v-b2", g, 12, "s5-v-2");
H.drive("s5-v-d3", "s5-v-b3", g, 0, "s5-v-3");
