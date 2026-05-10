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
