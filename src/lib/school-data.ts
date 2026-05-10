// Central school data for EduCard Pro.
// Mirrors the Philippine DepEd K-12 hierarchy used across every page:
//   School
//   └── Department (JHS = Grades 7–10, SHS = Grades 11–12)
//       └── Grade Level
//           └── Section (named after Flowers / Scientists / Virtues for JHS,
//                        and "[Grade] - [Strand] - [Name]" for SHS)
//               └── Learner (identified by 12-digit LRN)
//
// Every page (Dashboard, Students, Attendance, Grades, ID Cards, Alerts)
// must source its mock data from here so a learner in Grade 7 - Sampaguita
// on one page is the same learner everywhere.

export const SCHOOL_NAME = "St. Mary's Academy";
export const SCHOOL_YEAR = "2025–2026";

// DepEd SF2 (School Form 2) target attendance rate.
export const SF2_TARGET = 95;

export type DepartmentKey = "JHS" | "SHS";

// Senior High School academic / TVL strands.
export type Strand = "STEM" | "ABM" | "HUMSS" | "GAS" | "TVL-ICT" | "TVL-HE";

export type Learner = {
  lrn: string; // 12-digit Learner Reference Number
  firstName: string;
  middleInitial: string;
  lastName: string;
  gpa: number;
  attendanceRate: number; // 0-100
};

export type Section = {
  id: string; // e.g. "g7-sampaguita"
  /** JHS: e.g. "Sampaguita". SHS: e.g. "St. Jude" */
  name: string;
  /** SHS only — track/strand */
  strand?: Strand;
  adviser: string;
  learners: Learner[];
};

export type GradeLevel = {
  level: 7 | 8 | 9 | 10 | 11 | 12;
  label: string; // "Grade 7"
  sections: Section[];
};

export type Department = {
  key: DepartmentKey;
  label: string;
  caption: string;
  grades: GradeLevel[];
};

// Helpers ---------------------------------------------------------------------

/** Display name for a section, e.g. "Grade 7 - Sampaguita" or
 *  "Grade 11 - STEM - St. Jude". */
export function sectionLabel(grade: GradeLevel, section: Section): string {
  if (section.strand) {
    return `${grade.label} - ${section.strand} - ${section.name}`;
  }
  return `${grade.label} - ${section.name}`;
}

export function fullName(l: Learner): string {
  return `${l.firstName} ${l.middleInitial}. ${l.lastName}`;
}

// Data ------------------------------------------------------------------------

export const departments: Department[] = [
  {
    key: "JHS",
    label: "Junior High School",
    caption: "Grades 7 – 10",
    grades: [
      {
        level: 7,
        label: "Grade 7",
        sections: [
          {
            id: "g7-sampaguita",
            name: "Sampaguita",
            adviser: "Ms. Aurora Aquino",
            learners: [
              { lrn: "136728140987", firstName: "Juan", middleInitial: "M", lastName: "Dela Cruz", gpa: 92, attendanceRate: 96.4 },
              { lrn: "136728140988", firstName: "Carlo", middleInitial: "P", lastName: "Villanueva", gpa: 87, attendanceRate: 95.8 },
              { lrn: "136728140989", firstName: "Bea", middleInitial: "L", lastName: "Soriano", gpa: 90, attendanceRate: 97.1 },
            ],
          },
          {
            id: "g7-rosal",
            name: "Rosal",
            adviser: "Mr. Benjie Lopez",
            learners: [
              { lrn: "136728140312", firstName: "Maria", middleInitial: "L", lastName: "Santos", gpa: 88, attendanceRate: 93.5 },
              { lrn: "136728140098", firstName: "Marco", middleInitial: "T", lastName: "Reyes", gpa: 68, attendanceRate: 88.2 },
              { lrn: "136728140099", firstName: "Trisha", middleInitial: "F", lastName: "Domingo", gpa: 84, attendanceRate: 92.4 },
            ],
          },
        ],
      },
      {
        level: 8,
        label: "Grade 8",
        sections: [
          {
            id: "g8-adelfa",
            name: "Adelfa",
            adviser: "Ms. Carmela Cruz",
            learners: [
              { lrn: "136728140455", firstName: "Karina", middleInitial: "B", lastName: "Bautista", gpa: 86, attendanceRate: 92.0 },
              { lrn: "136728140456", firstName: "Renz", middleInitial: "G", lastName: "Galang", gpa: 81, attendanceRate: 90.5 },
            ],
          },
          {
            id: "g8-ilang-ilang",
            name: "Ilang-Ilang",
            adviser: "Mr. Dario Tan",
            learners: [
              { lrn: "136728140457", firstName: "Patricia", middleInitial: "R", lastName: "Lim", gpa: 79, attendanceRate: 88.7 },
              { lrn: "136728140458", firstName: "Mikael", middleInitial: "S", lastName: "Cortes", gpa: 74, attendanceRate: 85.9 },
            ],
          },
        ],
      },
      {
        level: 9,
        label: "Grade 9",
        sections: [
          {
            id: "g9-rizal",
            name: "Rizal", // Hero section
            adviser: "Ms. Elena Bautista",
            learners: [
              { lrn: "136728140511", firstName: "Andrea", middleInitial: "P", lastName: "Mercado", gpa: 90, attendanceRate: 94.0 },
              { lrn: "136728140512", firstName: "Luis", middleInitial: "C", lastName: "Mendoza", gpa: 85, attendanceRate: 92.6 },
            ],
          },
          {
            id: "g9-bonifacio",
            name: "Bonifacio", // Hero section
            adviser: "Mr. Felix Ramos",
            learners: [
              { lrn: "136728140211", firstName: "Jose", middleInitial: "A", lastName: "Aguilar", gpa: 74, attendanceRate: 78.4 },
              { lrn: "136728140212", firstName: "Nadine", middleInitial: "V", lastName: "Castillo", gpa: 82, attendanceRate: 86.5 },
            ],
          },
        ],
      },
      {
        level: 10,
        label: "Grade 10",
        sections: [
          {
            id: "g10-newton",
            name: "Newton", // Scientist section
            adviser: "Ms. Glenda Reyes",
            learners: [
              { lrn: "136728140601", firstName: "Patricia", middleInitial: "D", lastName: "Lim", gpa: 86, attendanceRate: 95.6 },
              { lrn: "136728140602", firstName: "Ramon", middleInitial: "K", lastName: "Pineda", gpa: 91, attendanceRate: 96.4 },
            ],
          },
          {
            id: "g10-charity",
            name: "Charity", // Virtue section
            adviser: "Mr. Hector Santos",
            learners: [
              { lrn: "136728140603", firstName: "Sophia", middleInitial: "A", lastName: "Navarro", gpa: 88, attendanceRate: 93.2 },
              { lrn: "136728140604", firstName: "Gabriel", middleInitial: "T", lastName: "Esguerra", gpa: 84, attendanceRate: 90.7 },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "SHS",
    label: "Senior High School",
    caption: "Grades 11 – 12 · Academic & TVL Tracks",
    grades: [
      {
        level: 11,
        label: "Grade 11",
        sections: [
          {
            id: "g11-stem-stjude",
            name: "St. Jude",
            strand: "STEM",
            adviser: "Ms. Imelda Villanueva",
            learners: [
              { lrn: "136728140067", firstName: "Liza", middleInitial: "R", lastName: "Bautista", gpa: 94, attendanceRate: 96.8 },
              { lrn: "136728140068", firstName: "Aaron", middleInitial: "C", lastName: "Tiongson", gpa: 91, attendanceRate: 95.5 },
            ],
          },
          {
            id: "g11-abm-sttherese",
            name: "St. Therese",
            strand: "ABM",
            adviser: "Mr. Joel Mercado",
            learners: [
              { lrn: "136728140033", firstName: "Diego", middleInitial: "N", lastName: "Aquino", gpa: 79, attendanceRate: 90.3 },
              { lrn: "136728140034", firstName: "Camille", middleInitial: "P", lastName: "Salazar", gpa: 85, attendanceRate: 93.0 },
            ],
          },
        ],
      },
      {
        level: 12,
        label: "Grade 12",
        sections: [
          {
            id: "g12-humss-stignatius",
            name: "St. Ignatius",
            strand: "HUMSS",
            adviser: "Ms. Karla Domingo",
            learners: [
              { lrn: "136728140801", firstName: "Therese", middleInitial: "M", lastName: "Quintos", gpa: 87, attendanceRate: 87.4 },
              { lrn: "136728140802", firstName: "Paolo", middleInitial: "B", lastName: "Yulo", gpa: 80, attendanceRate: 84.0 },
            ],
          },
          {
            id: "g12-tvlict-stfrancis",
            name: "St. Francis",
            strand: "TVL-ICT",
            adviser: "Mr. Lito Pascual",
            learners: [
              { lrn: "136728140803", firstName: "Patricia", middleInitial: "D", lastName: "Lim", gpa: 86, attendanceRate: 94.1 },
              { lrn: "136728140804", firstName: "Enrique", middleInitial: "S", lastName: "Bondoc", gpa: 89, attendanceRate: 95.6 },
            ],
          },
        ],
      },
    ],
  },
];

// Derived collections ---------------------------------------------------------

export type EnrichedSection = {
  department: Department;
  grade: GradeLevel;
  section: Section;
  enrolled: number;
  attendance: number; // weighted avg of learners
  belowTarget: boolean;
  label: string;
};

export const allSections: EnrichedSection[] = departments.flatMap((d) =>
  d.grades.flatMap((g) =>
    g.sections.map<EnrichedSection>((s) => {
      const enrolled = s.learners.length;
      const attendance =
        enrolled === 0
          ? 0
          : s.learners.reduce((a, l) => a + l.attendanceRate, 0) / enrolled;
      return {
        department: d,
        grade: g,
        section: s,
        enrolled,
        attendance,
        belowTarget: attendance < SF2_TARGET,
        label: sectionLabel(g, s),
      };
    }),
  ),
);

export type EnrichedLearner = {
  learner: Learner;
  department: Department;
  grade: GradeLevel;
  section: Section;
  sectionLabel: string;
  status: "On Track" | "At Risk";
};

export const allLearners: EnrichedLearner[] = departments.flatMap((d) =>
  d.grades.flatMap((g) =>
    g.sections.flatMap((s) =>
      s.learners.map<EnrichedLearner>((learner) => ({
        learner,
        department: d,
        grade: g,
        section: s,
        sectionLabel: sectionLabel(g, s),
        status: learner.attendanceRate < SF2_TARGET || learner.gpa < 75 ? "At Risk" : "On Track",
      })),
    ),
  ),
);

export function departmentStats(dept: Department) {
  const sections = dept.grades.flatMap((g) =>
    g.sections.map((s) => allSections.find((es) => es.section.id === s.id)!),
  );
  const enrolled = sections.reduce((a, s) => a + s.enrolled, 0);
  const present = sections.reduce(
    (a, s) => a + Math.round((s.attendance / 100) * s.enrolled),
    0,
  );
  const rate = enrolled === 0 ? 0 : (present / enrolled) * 100;
  const below = sections.filter((s) => s.belowTarget).length;
  return { enrolled, present, rate, sections: sections.length, below };
}

export const totals = {
  enrolled: allLearners.length,
  present: allLearners.reduce(
    (a, l) => a + (l.learner.attendanceRate >= 50 ? 1 : 0),
    0,
  ),
  sections: allSections.length,
  below: allSections.filter((s) => s.belowTarget).length,
  campusAttendance:
    allLearners.reduce((a, l) => a + l.learner.attendanceRate, 0) /
    Math.max(allLearners.length, 1),
};


// ============================================================================
// Phase 0 — Extended Mock Data
// ============================================================================

// 0-A: Subject lists --------------------------------------------------------

export const SUBJECTS_JHS = ["Math", "Science", "English", "Filipino", "AP", "MAPEH", "Values Ed", "TLE"];

export const SUBJECTS_SHS_CORE = ["Oral Communication", "Reading & Writing", "21st Century Lit", "General Math", "Earth Science", "Personal Development", "PE & Health"];

export const SUBJECTS_SHS_STRAND: Record<Strand, string[]> = {
  "STEM":    ["Pre-Calculus", "General Physics I", "General Chemistry I"],
  "ABM":     ["Business Math", "Fundamentals of ABM", "Business Ethics"],
  "HUMSS":   ["Creative Writing", "Philippine Politics", "Community Engagement"],
  "GAS":     ["Research in Daily Life", "Applied Economics"],
  "TVL-ICT": ["Computer Systems Servicing", "Web Development", "Programming"],
  "TVL-HE":  ["Food & Beverage Services", "Bread & Pastry Production"],
};

// 0-B: Grade records --------------------------------------------------------

export type QuarterGrade = { q1: number; q2: number; q3: number; q4: number | null };
export type GradeRecord = { lrn: string; subject: string; grades: QuarterGrade };

export const gradeRecords: GradeRecord[] = [
  // Juan Dela Cruz (136728140987)
  { lrn: "136728140987", subject: "Math",      grades: { q1: 89, q2: 91, q3: 92, q4: null } },
  { lrn: "136728140987", subject: "Science",   grades: { q1: 87, q2: 88, q3: 90, q4: null } },
  { lrn: "136728140987", subject: "English",   grades: { q1: 85, q2: 87, q3: 88, q4: null } },
  { lrn: "136728140987", subject: "Filipino",  grades: { q1: 91, q2: 93, q3: 94, q4: null } },
  { lrn: "136728140987", subject: "AP",        grades: { q1: 88, q2: 90, q3: 91, q4: null } },
  { lrn: "136728140987", subject: "MAPEH",     grades: { q1: 93, q2: 94, q3: 95, q4: null } },
  { lrn: "136728140987", subject: "Values Ed", grades: { q1: 92, q2: 93, q3: 94, q4: null } },
  { lrn: "136728140987", subject: "TLE",       grades: { q1: 88, q2: 89, q3: 90, q4: null } },

  // Carlo Villanueva (136728140988)
  { lrn: "136728140988", subject: "Math",      grades: { q1: 82, q2: 84, q3: 85, q4: null } },
  { lrn: "136728140988", subject: "Science",   grades: { q1: 80, q2: 82, q3: 83, q4: null } },
  { lrn: "136728140988", subject: "English",   grades: { q1: 84, q2: 86, q3: 87, q4: null } },
  { lrn: "136728140988", subject: "Filipino",  grades: { q1: 86, q2: 88, q3: 89, q4: null } },
  { lrn: "136728140988", subject: "AP",        grades: { q1: 81, q2: 83, q3: 84, q4: null } },
  { lrn: "136728140988", subject: "MAPEH",     grades: { q1: 88, q2: 89, q3: 90, q4: null } },
  { lrn: "136728140988", subject: "Values Ed", grades: { q1: 85, q2: 86, q3: 87, q4: null } },
  { lrn: "136728140988", subject: "TLE",       grades: { q1: 72, q2: 74, q3: 74, q4: null } }, // at-risk

  // Bea Soriano (136728140989)
  { lrn: "136728140989", subject: "Math",      grades: { q1: 88, q2: 89, q3: 90, q4: null } },
  { lrn: "136728140989", subject: "Science",   grades: { q1: 90, q2: 91, q3: 92, q4: null } },
  { lrn: "136728140989", subject: "English",   grades: { q1: 86, q2: 87, q3: 88, q4: null } },
  { lrn: "136728140989", subject: "Filipino",  grades: { q1: 89, q2: 90, q3: 91, q4: null } },
  { lrn: "136728140989", subject: "AP",        grades: { q1: 87, q2: 88, q3: 89, q4: null } },
  { lrn: "136728140989", subject: "MAPEH",     grades: { q1: 92, q2: 93, q3: 94, q4: null } },
  { lrn: "136728140989", subject: "Values Ed", grades: { q1: 91, q2: 92, q3: 93, q4: null } },
  { lrn: "136728140989", subject: "TLE",       grades: { q1: 87, q2: 88, q3: 89, q4: null } },

  // Marco Reyes (136728140098) — at-risk student
  { lrn: "136728140098", subject: "Math",      grades: { q1: 65, q2: 67, q3: 68, q4: null } },
  { lrn: "136728140098", subject: "Science",   grades: { q1: 63, q2: 65, q3: 67, q4: null } },
  { lrn: "136728140098", subject: "English",   grades: { q1: 70, q2: 71, q3: 72, q4: null } },
  { lrn: "136728140098", subject: "Filipino",  grades: { q1: 71, q2: 72, q3: 73, q4: null } },
  { lrn: "136728140098", subject: "AP",        grades: { q1: 68, q2: 69, q3: 68, q4: null } },
  { lrn: "136728140098", subject: "MAPEH",     grades: { q1: 75, q2: 76, q3: 76, q4: null } },
  { lrn: "136728140098", subject: "Values Ed", grades: { q1: 74, q2: 75, q3: 75, q4: null } },
  { lrn: "136728140098", subject: "TLE",       grades: { q1: 70, q2: 71, q3: 72, q4: null } },
];

// 0-C: Daily attendance logs ------------------------------------------------

export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type AttendanceLog = {
  lrn: string;
  date: string;       // "2026-05-05"
  timeIn: string;     // "07:38"
  timeOut: string;    // "16:10"
  status: AttendanceStatus;
};

// 10 school days for the 3 main G7-Sampaguita learners
export const attendanceLogs: AttendanceLog[] = [
  { lrn:"136728140987", date:"2026-04-28", timeIn:"07:38", timeOut:"16:05", status:"present" },
  { lrn:"136728140987", date:"2026-04-29", timeIn:"07:41", timeOut:"16:10", status:"present" },
  { lrn:"136728140987", date:"2026-04-30", timeIn:"08:15", timeOut:"16:00", status:"late" },
  { lrn:"136728140987", date:"2026-05-05", timeIn:"07:35", timeOut:"16:08", status:"present" },
  { lrn:"136728140987", date:"2026-05-06", timeIn:"07:42", timeOut:"16:05", status:"present" },
  { lrn:"136728140987", date:"2026-05-07", timeIn:"07:39", timeOut:"16:10", status:"present" },
  { lrn:"136728140987", date:"2026-05-08", timeIn:"07:40", timeOut:"16:05", status:"present" },
  { lrn:"136728140987", date:"2026-05-09", timeIn:"",      timeOut:"",      status:"absent" },
  { lrn:"136728140987", date:"2026-05-10", timeIn:"07:38", timeOut:"16:10", status:"present" },

  { lrn:"136728140988", date:"2026-05-09", timeIn:"",      timeOut:"",      status:"absent" },
  { lrn:"136728140988", date:"2026-05-10", timeIn:"",      timeOut:"",      status:"absent" }, // 2 consecutive — triggers warning

  { lrn:"136728140989", date:"2026-05-09", timeIn:"07:42", timeOut:"16:05", status:"present" },
  { lrn:"136728140989", date:"2026-05-10", timeIn:"07:42", timeOut:"16:08", status:"present" },

  { lrn:"136728140098", date:"2026-05-06", timeIn:"",      timeOut:"",      status:"absent" },
  { lrn:"136728140098", date:"2026-05-07", timeIn:"",      timeOut:"",      status:"absent" },
  { lrn:"136728140098", date:"2026-05-08", timeIn:"",      timeOut:"",      status:"absent" },
  { lrn:"136728140098", date:"2026-05-09", timeIn:"",      timeOut:"",      status:"absent" },
  { lrn:"136728140098", date:"2026-05-10", timeIn:"",      timeOut:"",      status:"absent" }, // 5 consecutive — triggers severe warning
];

// 0-D: Parent profiles ------------------------------------------------------

export type ParentProfile = {
  id: string;
  name: string;
  relationship: "Mother" | "Father" | "Guardian";
  phone: string;
  messengerLinked: boolean;
  smsEnabled: boolean;
  linkedLrns: string[];
};

export const parentProfiles: ParentProfile[] = [
  {
    id: "p001",
    name: "Maria Dela Cruz",
    relationship: "Mother",
    phone: "+63 917 123 4567",
    messengerLinked: true,
    smsEnabled: false,
    linkedLrns: ["136728140987", "136728140989"], // Juan + Bea (siblings for demo)
  },
  {
    id: "p002",
    name: "Rodrigo Villanueva",
    relationship: "Father",
    phone: "+63 918 234 5678",
    messengerLinked: false,
    smsEnabled: true,
    linkedLrns: ["136728140988"],
  },
  {
    id: "p003",
    name: "Lourdes Reyes",
    relationship: "Mother",
    phone: "+63 919 345 6789",
    messengerLinked: true,
    smsEnabled: true,
    linkedLrns: ["136728140098"],
  },
];

// 0-E: Notification history -------------------------------------------------

export type NotifChannel = "messenger" | "sms" | "system";
export type NotifStatus = "sent" | "failed" | "pending";
export type NotificationRecord = {
  id: string;
  parentId: string;
  channel: NotifChannel;
  status: NotifStatus;
  message: string;
  triggeredBy: "attendance_scan" | "grade_posted" | "absence_warning" | "system";
  sentAt: string;
};

export const notificationHistory: NotificationRecord[] = [
  { id:"n001", parentId:"p001", channel:"messenger", status:"sent",    message:"Juan pumasok sa paaralan ngayong 7:38 AM — May 10", triggeredBy:"attendance_scan",  sentAt:"2026-05-10 07:38" },
  { id:"n002", parentId:"p001", channel:"messenger", status:"sent",    message:"Bagong marka para kay Juan: Math Q3 = 92",          triggeredBy:"grade_posted",      sentAt:"2026-05-09 14:00" },
  { id:"n003", parentId:"p002", channel:"sms",       status:"failed",  message:"Carlo ay hindi pumasok ngayon — May 10",            triggeredBy:"absence_warning",   sentAt:"2026-05-10 08:00" },
  { id:"n004", parentId:"p002", channel:"sms",       status:"sent",    message:"Carlo ay hindi pumasok ngayon — May 9",             triggeredBy:"absence_warning",   sentAt:"2026-05-09 08:00" },
  { id:"n005", parentId:"p003", channel:"messenger", status:"pending", message:"Marco ay hindi pumasok ng 5 araw. Mangyaring makipag-ugnayan sa paaralan.", triggeredBy:"absence_warning", sentAt:"2026-05-10 08:00" },
  { id:"n006", parentId:"p001", channel:"messenger", status:"sent",    message:"Bea pumasok sa paaralan ngayong 7:42 AM — May 10",  triggeredBy:"attendance_scan",  sentAt:"2026-05-10 07:42" },
];

// 0-F: Conduct logs ---------------------------------------------------------

export type ConductType = "Positive" | "Note" | "Warning";
export type ConductLog = {
  lrn: string;
  date: string;
  item: string;
  type: ConductType;
  recordedBy: string;
};

export const conductLogs: ConductLog[] = [
  { lrn:"136728140987", date:"May 5",  item:"Participated actively in Science Lab", type:"Positive", recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140987", date:"Apr 28", item:"Submitted group project on time",       type:"Positive", recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140987", date:"Apr 12", item:"Late arrival — 8:15 AM",                type:"Note",     recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140988", date:"May 7",  item:"2nd consecutive absence — parents notified", type:"Warning", recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140988", date:"Apr 20", item:"Incomplete homework submission",        type:"Note",     recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140989", date:"May 5",  item:"Excellent class participation — Filipino", type:"Positive", recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140989", date:"Apr 30", item:"Ranked 1st in Math Quiz",               type:"Positive", recordedBy:"Ms. Aurora Aquino" },
  { lrn:"136728140098", date:"May 8",  item:"4th consecutive absence — referral to guidance", type:"Warning", recordedBy:"Mr. Benjie Lopez" },
  { lrn:"136728140098", date:"Apr 15", item:"Struggling with written exams — extra support assigned", type:"Note", recordedBy:"Mr. Benjie Lopez" },
];

// 0-G: School calendar ------------------------------------------------------

export const schoolCalendar = {
  schoolYear: SCHOOL_YEAR,
  currentQuarter: 3,
  currentWeek: 6,
  quarters: [
    { label: "Q1", start: "2025-08-26", end: "2025-10-17" },
    { label: "Q2", start: "2025-10-21", end: "2025-12-19" },
    { label: "Q3", start: "2026-01-12", end: "2026-03-27" },
    { label: "Q4", start: "2026-04-07", end: "2026-05-30" },
  ],
  holidays: ["2026-04-09", "2026-04-10", "2026-05-01"],
  schoolDaysThisQuarter: 54,
  schoolDaysCompleted: 52,
};

// 0-H: ID card print history ------------------------------------------------

export type IDPrintRecord = {
  lrn: string;
  printedAt: string;
  printedBy: string;
  type: "original" | "reprint";
  reprintReason?: string;
};

export const idPrintHistory: IDPrintRecord[] = [
  { lrn:"136728140987", printedAt:"2025-08-26 09:00", printedBy:"Ms. Registrar Cruz", type:"original" },
  { lrn:"136728140988", printedAt:"2025-08-26 09:05", printedBy:"Ms. Registrar Cruz", type:"original" },
  { lrn:"136728140989", printedAt:"2025-08-26 09:10", printedBy:"Ms. Registrar Cruz", type:"original" },
  { lrn:"136728140987", printedAt:"2026-03-15 10:00", printedBy:"Ms. Registrar Cruz", type:"reprint",  reprintReason:"Lost" },
  { lrn:"136728140456", printedAt:"2025-08-27 09:00", printedBy:"Ms. Registrar Cruz", type:"original" },
];

export const idReprintRequests = [
  { lrn:"136728140987", studentName:"Juan M. Dela Cruz",  section:"Grade 7 - Sampaguita", reason:"Lost",    requestedAt:"2026-05-08", status:"pending" },
  { lrn:"136728140456", studentName:"Renz G. Galang",     section:"Grade 8 - Adelfa",     reason:"Damaged", requestedAt:"2026-05-07", status:"approved" },
  { lrn:"136728140211", studentName:"Jose A. Aguilar",    section:"Grade 9 - Bonifacio",  reason:"Lost",    requestedAt:"2026-05-06", status:"pending" },
];

// 0-I: Teacher and Parent Contact Information -------------------------------

export type TeacherContact = {
  teacher: string;
  subject: string;
  role: string;
  phone: string;
  messenger: string;
  facebook: string;
  email: string;
  children?: string[]; // For parent view - which children they teach
};

export type ParentContact = {
  parent: string;
  children: string[];
  section: string;
  phone: string;
  messenger: string;
  facebook: string;
  email: string;
};

export const teacherContacts: TeacherContact[] = [
  {
    teacher: "Ms. Aurora Aquino",
    subject: "Grade 7 - Sampaguita",
    role: "Adviser & Math Teacher",
    phone: "+63 917 123 4567",
    messenger: "aurora.aquino",
    facebook: "aurora.aquino.teacher",
    email: "a.aquino@stmarys.edu.ph",
    children: ["Juan", "Bea"],
  },
  {
    teacher: "Mr. Roberto Santos",
    subject: "Grade 7 - Science",
    role: "Science Teacher",
    phone: "+63 918 234 5678",
    messenger: "roberto.santos",
    facebook: "roberto.santos.teacher",
    email: "r.santos@stmarys.edu.ph",
    children: ["Juan", "Bea"],
  },
  {
    teacher: "Ms. Elena Reyes",
    subject: "Grade 7 - English",
    role: "English Teacher",
    phone: "+63 919 345 6789",
    messenger: "elena.reyes",
    facebook: "elena.reyes.teacher",
    email: "e.reyes@stmarys.edu.ph",
    children: ["Juan", "Bea"],
  },
];

export const parentContacts: ParentContact[] = [
  {
    parent: "Maria Dela Cruz",
    children: ["Juan M. Dela Cruz", "Bea M. Dela Cruz"],
    section: "Grade 7 - Sampaguita",
    phone: "+63 920 456 7890",
    messenger: "maria.delacruz",
    facebook: "maria.delacruz.parent",
    email: "maria.delacruz@gmail.com",
  },
  {
    parent: "Jose Reyes",
    children: ["Sofia Reyes"],
    section: "Grade 7 - Sampaguita",
    phone: "+63 921 567 8901",
    messenger: "jose.reyes",
    facebook: "jose.reyes.parent",
    email: "jose.reyes@gmail.com",
  },
  {
    parent: "Ana Santos",
    children: ["Miguel Santos"],
    section: "Grade 7 - Sampaguita",
    phone: "+63 922 678 9012",
    messenger: "ana.santos",
    facebook: "ana.santos.parent",
    email: "ana.santos@gmail.com",
  },
];

