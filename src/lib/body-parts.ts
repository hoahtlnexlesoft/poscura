export type BodyPartKey = "head" | "shoulders" | "spine" | "pelvis";

export interface BodyPartInsight {
  title: string;
  status: "Severe" | "Moderate" | "Balanced";
  avgTilt: string;
  delta: string;
  deltaDirection: "up" | "down";
  mainRisk?: string;
}

export interface BodyPartData {
  key: BodyPartKey;
  name: string;
  score: number;
  status: "Moderate" | "Severe" | "Balanced";
  description: string;
  series: Array<{ date: string; a: number; b: number; c: number }>;
  legend: { a: string; b: string; c: string };
  insights: BodyPartInsight[];
  riskAssessment: Array<{ title: string; body: string }>;
}

const headData: BodyPartData = {
  key: "head",
  name: "Head & Neck",
  score: 74,
  status: "Moderate",
  description: "This chart shows how your average joint deviation changed during the multiple session reports",
  legend: {
    a: "Head tilt angle (Forward/Back)",
    b: "Head tilt angle (Lateral)",
    c: "Neck-cervical spine angle",
  },
  series: [
    { date: "mm/dd", a: 12, b: 7, c: 3 },
    { date: "mm/dd", a: 8, b: 3, c: 2 },
    { date: "mm/dd", a: 14, b: 9, c: 7 },
    { date: "mm/dd", a: 11, b: 9, c: 7 },
    { date: "mm/dd", a: 19, b: 14, c: 12 },
  ],
  insights: [
    { title: "Head Tilt Angle (Forward/Back)", status: "Severe", avgTilt: "10°", delta: "4°", deltaDirection: "up" },
    { title: "Head Tilt Angle (Lateral)", status: "Severe", avgTilt: "15°", delta: "4°", deltaDirection: "up", mainRisk: "Tilt 25° (4m 50s)" },
    { title: "Neck-cervical Spine Angle", status: "Balanced", avgTilt: "3°", delta: "5°", deltaDirection: "down" },
  ],
  riskAssessment: [
    { title: "Head Muscle Strain", body: "Long forward/side head tilt overloads neck muscles." },
    { title: "Head Postural Imbalance", body: "Habitual head tilt may affect gaze and cause neck/spine curvature." },
  ],
};

const shouldersData: BodyPartData = {
  key: "shoulders",
  name: "Shoulders & Upper Back",
  score: 82,
  status: "Balanced",
  description: "This chart shows how your average shoulder deviation changed during the multiple session reports",
  legend: { a: "Shoulder line", b: "Shoulder protraction", c: "Thoracic spine" },
  series: [
    { date: "mm/dd", a: 6, b: 4, c: 5 },
    { date: "mm/dd", a: 5, b: 3, c: 4 },
    { date: "mm/dd", a: 7, b: 5, c: 6 },
    { date: "mm/dd", a: 4, b: 3, c: 4 },
    { date: "mm/dd", a: 5, b: 4, c: 5 },
  ],
  insights: [
    { title: "Shoulder Line", status: "Moderate", avgTilt: "6°", delta: "2°", deltaDirection: "down" },
    { title: "Shoulder Protraction", status: "Balanced", avgTilt: "4°", delta: "1°", deltaDirection: "down" },
  ],
  riskAssessment: [
    { title: "Shoulder Tension", body: "Uneven shoulders cause asymmetric muscle loading." },
  ],
};

const spineData: BodyPartData = {
  key: "spine",
  name: "Spine & Torso",
  score: 68,
  status: "Moderate",
  description: "This chart shows how your average spine deviation changed during the multiple session reports",
  legend: { a: "Coronal spine", b: "Lumbar spine", c: "Thoracic spine" },
  series: [
    { date: "mm/dd", a: 10, b: 8, c: 7 },
    { date: "mm/dd", a: 12, b: 9, c: 8 },
    { date: "mm/dd", a: 11, b: 10, c: 9 },
    { date: "mm/dd", a: 14, b: 12, c: 10 },
    { date: "mm/dd", a: 15, b: 13, c: 11 },
  ],
  insights: [
    { title: "Coronal Spine", status: "Moderate", avgTilt: "12°", delta: "3°", deltaDirection: "up" },
    { title: "Lumbar Spine", status: "Moderate", avgTilt: "10°", delta: "2°", deltaDirection: "up" },
  ],
  riskAssessment: [
    { title: "Lower Back Strain", body: "Persistent spine deviation can stress lumbar discs." },
  ],
};

const pelvisData: BodyPartData = {
  key: "pelvis",
  name: "Pelvis & Lower Back",
  score: 70,
  status: "Moderate",
  description: "This chart shows how your average pelvic deviation changed during the multiple session reports",
  legend: { a: "Pelvic tilt", b: "Hip alignment", c: "Lumbar lordosis" },
  series: [
    { date: "mm/dd", a: 8, b: 6, c: 7 },
    { date: "mm/dd", a: 10, b: 7, c: 8 },
    { date: "mm/dd", a: 12, b: 9, c: 9 },
    { date: "mm/dd", a: 13, b: 10, c: 10 },
    { date: "mm/dd", a: 15, b: 11, c: 12 },
  ],
  insights: [
    { title: "Pelvic Tilt", status: "Moderate", avgTilt: "11°", delta: "3°", deltaDirection: "up" },
    { title: "Hip Alignment", status: "Balanced", avgTilt: "5°", delta: "1°", deltaDirection: "down" },
  ],
  riskAssessment: [
    { title: "Hip Flexor Tightness", body: "Anterior pelvic tilt overloads hip flexors and lower back." },
  ],
};

export const bodyParts: Record<BodyPartKey, BodyPartData> = {
  head: headData,
  shoulders: shouldersData,
  spine: spineData,
  pelvis: pelvisData,
};
