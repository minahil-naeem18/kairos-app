export function calculateMatchScore(profile: any, opportunity: any): number {
  // Primarily field-based matching
  if (profile.fieldId && opportunity.fieldId) {
    if (profile.fieldId === opportunity.fieldId) {
      return 95; // strong field match
    }
    return 0; // different field, not a match
  }

  // If opportunity has no specific field (open to all), give it a baseline score
  if (!opportunity.fieldId) {
    let score = 50;

    // Small boost for degree level match, if both are set
    if (
      profile.degreeLevel &&
      opportunity.degreeLevels?.includes(profile.degreeLevel)
    ) {
      score += 20;
    }

    // Small boost for funding preference match
    if (
      profile.fundingPreference &&
      opportunity.fundingType === profile.fundingPreference
    ) {
      score += 15;
    }

    return Math.min(score, 90);
  }

  return 0;
}

export function getMatchReasons(profile: any, opportunity: any): string[] {
  const reasons: string[] = [];

  if (
    profile.fieldId &&
    opportunity.fieldId &&
    profile.fieldId === opportunity.fieldId &&
    opportunity.field?.name
  ) {
    reasons.push(`Matches your field: ${opportunity.field.name}`);
  }

  if (!opportunity.fieldId) {
    reasons.push("Open to all fields");
  }

  if (
    profile.degreeLevel &&
    opportunity.degreeLevels?.includes(profile.degreeLevel)
  ) {
    reasons.push(`Matches your degree level`);
  }

  if (
    profile.fundingPreference &&
    opportunity.fundingType === profile.fundingPreference
  ) {
    reasons.push(`Matches your funding preference`);
  }

  return reasons;
}