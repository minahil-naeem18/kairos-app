export function calculateMatchScore(profile: any, opportunity: any): number {
  let score = 0;
  let maxScore = 0;

  // Degree level match (weight: 30)
  maxScore += 30;
  if (
    profile.degreeLevel &&
    opportunity.degreeLevels?.includes(profile.degreeLevel)
  ) {
    score += 30;
  } else if (!opportunity.degreeLevels || opportunity.degreeLevels.length === 0) {
    score += 10; // opportunity is open to anyone
  }

  // Field match (weight: 25)
  maxScore += 25;
  if (profile.fieldId && opportunity.fieldId === profile.fieldId) {
    score += 25;
  } else if (!opportunity.fieldId) {
    score += 10;
  }

  // Funding preference match (weight: 20)
  maxScore += 20;
  if (
    profile.fundingPreference &&
    opportunity.fundingType === profile.fundingPreference
  ) {
    score += 20;
  } else if (!profile.fundingPreference) {
    score += 10;
  }

  // Remote preference match (weight: 15)
  maxScore += 15;
  if (
    profile.remotePreference &&
    opportunity.remoteStatus === profile.remotePreference
  ) {
    score += 15;
  } else if (!profile.remotePreference) {
    score += 8;
  }

  // Skills overlap (weight: 10)
  maxScore += 10;
  if (profile.skills?.length > 0 && opportunity.skills?.length > 0) {
    const overlap = profile.skills.filter((s: string) =>
      opportunity.skills.some((os: string) =>
        os.toLowerCase().includes(s.toLowerCase())
      )
    );
    if (overlap.length > 0) {
      score += 10;
    }
  } else {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}