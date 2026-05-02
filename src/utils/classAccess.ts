export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  purchasedCourses?: string[];
}

export interface Course {
  id: string;
  type: 'free' | 'paid';
  title: string;
}

export function canJoinClass(user: User | null, course: Course): boolean {
  if (!user) return false;
  if (course.type === 'free') return true;
  if (course.type === 'paid' && user.purchasedCourses?.includes(course.id)) return true;
  return false;
}

export function generateClassRoomId(courseId: string, batchId?: string): string {
  const base = `course-${courseId}`;
  return batchId ? `${base}-batch-${batchId}` : base;
}
