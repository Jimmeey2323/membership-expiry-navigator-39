
interface CleaningRule {
  keywords: string[];
  category: string;
  matchType?: 'combined';
}

interface SpecialPattern {
  pattern: RegExp;
  handler: (matches: RegExpMatchArray) => string;
}

const rules: CleaningRule[] = [
  {
    keywords: ['amped up', 'amped'],
    category: 'Session'
  },
  {
    keywords: ['powercycle', 'power cycle'],
    category: 'Session'
  },
  {
    keywords: ['studio single class'],
    category: 'Studio Single class'
  },
  {
    keywords: ['private', 'single private'],
    category: 'Studio Private Class'
  },
  {
    keywords: ['annual unlimited'],
    category: 'Studio Annual Unlimited'
  },
  {
    keywords: ['studio', 'back body blaze', 'barre 57', 'cardio barre', 'fit', 
              'foundations', 'hiit', 'mat 57', 'recovery', 'sweat', "trainer's choice"],
    matchType: 'combined',
    category: 'Session'
  },
  {
    keywords: ['virtual', 'barre 57', 'single class'],
    matchType: 'combined',
    category: 'Session'
  }
];

const specialPatterns: SpecialPattern[] = [
  {
    pattern: /(\d+)\s*(month|week)\s+unlimited/i,
    handler: (matches) => `Studio ${matches[1]} ${matches[2].charAt(0).toUpperCase() + matches[2].slice(1)} Unlimited`
  },
  {
    pattern: /studio\s+(\d+)\s+class\s+package/i,
    handler: (matches) => `Studio ${matches[1]} Class Package`
  },
  {
    pattern: /virtual\s+(\d+)\s+(class package|month unlimited|week unlimited)/i,
    handler: (matches) => `Virtual ${matches[1]} ${matches[2]}`
  },
  {
    pattern: /newcomers\s+2\s+(for|week)\s+[12]/i,
    handler: (matches) => matches[1].toLowerCase() === 'week' ? 
      "Studio Newcomers 2 Week Unlimited" : 
      "Studio Newcomers 2 For 1"
  }
];

export const cleanMembershipName = (
  membershipName: string,
  category?: string,  
  memberId?: string
): string => {
  if (!memberId) return "";
  if (!membershipName) return "Others";
  if (category === "product") return "Retail";
  if (category === "event") return "Session";

  const item = String(membershipName).trim().toLowerCase();

  // Check special patterns first
  for (const {pattern, handler} of specialPatterns) {
    const matches = item.match(pattern);
    if (matches) {
      return handler(matches);
    }
  }

  // Check rules
  for (const rule of rules) {
    if (rule.matchType === 'combined') {
      const baseWord = rule.keywords[0];
      if (item.includes(baseWord)) {
        for (let i = 1; i < rule.keywords.length; i++) {
          if (item.includes(rule.keywords[i])) {
            return rule.category;
          }
        }
      }
    } else {
      if (rule.keywords.some(keyword => item.includes(keyword))) {
        return rule.category;
      }
    }
  }

  return "Others";
};
