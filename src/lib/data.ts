export const numberData = {
  lunMar: {
    firstLM: {
      lundi: [7, 54],
      mardi: [55, 10, 70],
    },
    secondLM: {
      lundi: [89, 57, 61],
      mardi: [16, 75, 96],
    },
    thirdLM: {
      lundi: [43, 39, 72],
      mardi: [34, 93, 27],
    }
  },
  marMer: {
    firstMM: {
      mardi: [88, 8, 46],
      mercredi: [44, 92],
    },
    secondMM: {
      mardi: [42, 38, 68],
      mercredi: [24, 83, 86],
    },
    thirdMM: {
      mardi: [53, 94],
      mercredi: [49, 35],
    }
  },
  merJeu: {
    firstMJ: {
      mercredi: [30, 9, 64],
      jeudi: [33, 3, 98],
    },
    secondMJ: {
      mercredi: [62, 58, 91],
      jeudi: [26, 1, 85],
    }
  },
  jeuVen: {
    firsJV: {
      jeudi: [31, 28],
      vendredi: [13, 80]
    },
    secondJV: {
      jeudi: [56, 78],
      vendredi: [22, 0, 87]
    },
    thirdJV: {
      jeudi: [63, 2, 95],
      vendredi: [59, 20, 36]
    }
  },
  vensam: {
    firstVS: {
      vendredi: [79, 47, 51],
      samedi: [15, 74, 97]
    },
    secondVS: {
      vendredi: [65, 67, 77],
      samedi: [76, 19, 11]
    }
  },
  samdim: {
    firstSD: {
      samedi: [50, 29, 21],
      dimanche: [12, 5, 82]
    },
    secondSD: {
      samedi: [71, 69, 32],
      dimanche: [23, 17, 90]
    },
    thirdSD: {
      samedi: [66, 60, 99],
      dimanche: [4, 45]
    }
  },
  dimlun: {
    firstDL: {
      dimanche: [40, 37, 41],
      lundi: [14, 4, 73]
    },
    secondDL: {
      dimanche: [52, 48, 81],
      lundi: [25, 18, 84]
    }
  }
};

// Function to find which sets contain a given number
export function findNumberInData(number: number) {
  const results: Array<{
    category: string;
    subCategory: string;
    days: Record<string, number[]>;
  }> = [];

  // Convert number to string for comparison
  const numStr = number.toString();

  // Search through all data
  for (const [category, subCategories] of Object.entries(numberData)) {
    for (const [subCategory, days] of Object.entries(subCategories as Record<string, any>)) {
      // Check if number exists in any day array
      const matchingDays: Record<string, number[]> = {};
      
      for (const [day, numbers] of Object.entries(days as Record<string, number[]>)) {
        if (numbers.includes(number)) {
          matchingDays[day] = numbers;
        }
      }

      // If we found matches in this subcategory
      if (Object.keys(matchingDays).length > 0) {
        results.push({
          category,
          subCategory,
          days: matchingDays
        });
      }
    }
  }

  return results;
}

// Function to get French day names
export function getFrenchDayName(englishDay: string): string {
  const dayMap: Record<string, string> = {
    lundi: "Monday",
    mardi: "Tuesday",
    mercredi: "Wednesday",
    jeudi: "Thursday",
    vendredi: "Friday",
    samedi: "Saturday",
    dimanche: "Sunday"
  };
  
  return dayMap[englishDay] || englishDay;
}

// Function to get English day names from French
export function getEnglishDayName(frenchDay: string): string {
  const dayMap: Record<string, string> = {
    lundi: "Monday",
    mardi: "Tuesday",
    mercredi: "Wednesday",
    jeudi: "Thursday",
    vendredi: "Friday",
    samedi: "Saturday",
    dimanche: "Sunday"
  };
  
  return dayMap[frenchDay] || frenchDay;
}