export interface Faculty {
  name: string;
  title: string;
  specialty: string;
  bio: string;
  photo?: string;
}

export const faculty: Faculty[] = [
  {
    name: 'Dr. Crispine Murhula',
    title: 'Resident Medical Officer',
    specialty: 'Internal Medicine',
    bio: 'Leads inpatient medical services and clinical attachment supervision.',
    photo: '/img/faculty/resident-medical-officer.jpg',
  },
  {
    name: 'Sr. Beatrice Osanga',
    title: 'Senior Nursing Officer',
    specialty: 'Maternal & Newborn Health',
    bio: 'Coordinates nursing attachments and preceptor assignment.',
    photo: '/img/faculty/senior-nursing-officer.jpg',
  },
  {
    name: 'Mr. Bozder Omondi',
    title: 'Chief Clinical Officer',
    specialty: 'Emergency & Outpatient Care',
    bio: 'Supervises clinical officer interns and emergency rotations.',
    photo: '/img/faculty/chief-clinical-officer.jpg',
  },
  {
    name: 'Mr. Anderson Abongo',
    title: 'Laboratory Manager',
    specialty: 'Medical Laboratory Science',
    bio: 'Oversees laboratory attachments and diagnostic quality assurance.',
    photo: '/img/faculty/laboratory-manager.jpg',
  },
];