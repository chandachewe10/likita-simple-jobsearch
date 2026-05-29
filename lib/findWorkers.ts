import { User } from '../types';
import { distanceKm } from './location';

export type WorkerMatch = {
  worker: User;
  distanceKm: number | null;
};

export function filterAndSortWorkers(
  workers: User[],
  selectedSkills: string[],
  employerLocation?: { latitude: number; longitude: number }
): WorkerMatch[] {
  let matches = workers.filter((u) => u.role === 'employee');

  if (selectedSkills.length > 0) {
    matches = matches.filter((u) =>
      (u.skills || []).some((skill) => selectedSkills.includes(skill))
    );
  }

  const withDistance: WorkerMatch[] = matches.map((worker) => ({
    worker,
    distanceKm:
      employerLocation && worker.location
        ? distanceKm(employerLocation, worker.location)
        : null,
  }));

  return withDistance.sort((a, b) => {
    const ratingA = a.worker.rating ?? -1;
    const ratingB = b.worker.rating ?? -1;
    if (ratingB !== ratingA) return ratingB - ratingA;

    const distA = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const distB = b.distanceKm ?? Number.POSITIVE_INFINITY;
    if (distA !== distB) return distA - distB;

    return a.worker.name.localeCompare(b.worker.name);
  });
}
