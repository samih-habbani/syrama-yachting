// Generate luxury placeholder images for yachts and services
export const getYachtImage = (yachtName: string): string => {
  const yachtImages: Record<string, string> = {
    Solaris: 'https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=1200&h=1400&fit=crop&q=85',
    Luna: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=1400&fit=crop&q=85',
    Eclipse: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=1400&fit=crop&q=85',
    Serenity: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=1400&fit=crop&q=85',
  };
  return yachtImages[yachtName] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=1400&fit=crop&q=85';
};

export const getServiceImage = (serviceName: string): string => {
  const serviceImages: Record<string, string> = {
    'Concierge Excellence': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=85',
    'Culinary Mastery': 'https://images.unsplash.com/photo-1504674900975-b238404519c0?w=800&h=600&fit=crop&q=85',
    'Water Excellence': 'https://images.unsplash.com/photo-1514432324607-2e88f1c241c7?w=800&h=600&fit=crop&q=85',
    'Wellness Sanctuary': 'https://images.unsplash.com/photo-1544161515-81aae3011b02?w=800&h=600&fit=crop&q=85',
    'Entertainment Curation': 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800&h=600&fit=crop&q=85',
    'Logistics & Operations': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=85',
  };
  return serviceImages[serviceName] || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=85';
};

export const getExperienceImage = (experienceName: string): string => {
  const experienceImages: Record<string, string> = {
    'Aquatic Adventures': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=85',
    'Curated Voyages': 'https://images.unsplash.com/photo-1507278895283-55a49baeb89c?w=800&h=600&fit=crop&q=85',
    'Grand Celebrations': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop&q=85',
    'Marine Discovery': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=85',
    'Gastronomic Excellence': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=85',
    'Serenity Retreats': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=85',
  };
  return experienceImages[experienceName] || 'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&h=600&fit=crop&q=85';
};
