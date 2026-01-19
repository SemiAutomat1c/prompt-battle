// Example battles that demonstrate good vs weak prompting techniques
export const EXAMPLE_BATTLES = [
  {
    id: 'coding',
    category: 'Coding',
    icon: '💻',
    task: 'Write a Python function that finds all prime numbers up to n',
    promptA: {
      text: 'Write code for prime numbers',
      label: 'Vague Prompt',
    },
    promptB: {
      text: 'Write a Python function `find_primes(n: int) -> list[int]` that returns all prime numbers up to n using the Sieve of Eratosthenes algorithm. Include type hints, a docstring with example usage, and handle edge cases (n < 2).',
      label: 'Precise Prompt',
    },
    teachingPoint: 'Specific prompts with technical requirements produce production-ready code.',
  },
  {
    id: 'creative',
    category: 'Creative Writing',
    icon: '✨',
    task: 'Write a short story opening paragraph',
    promptA: {
      text: 'Write a story about a detective',
      label: 'Generic Prompt',
    },
    promptB: {
      text: 'Write the opening paragraph (100-150 words) of a noir detective story set in 1940s Chicago. The detective is a cynical woman who just received a case that reminds her of her sister\'s unsolved disappearance. Use sensory details (rain, smoke, jazz) and first-person narration with a world-weary tone.',
      label: 'Atmospheric Prompt',
    },
    teachingPoint: 'Creative prompts need constraints to spark creativity, not limit it.',
  },
  {
    id: 'explanation',
    category: 'Explanation',
    icon: '📚',
    task: 'Explain how HTTPS works',
    promptA: {
      text: 'Explain HTTPS',
      label: 'Bare Minimum',
    },
    promptB: {
      text: 'Explain how HTTPS works to a junior web developer who understands HTTP but not cryptography. Cover: (1) the TLS handshake simplified, (2) why certificates matter, (3) what the padlock icon actually guarantees. Use an analogy involving sealed envelopes. Keep it under 300 words.',
      label: 'Audience-Aware',
    },
    teachingPoint: 'Great explanations require knowing your audience and structuring the content.',
  },
];

// Victory thresholds for badges
export const VICTORY_THRESHOLDS = {
  DOMINANT: 0.70,
  CLEAR: 0.60,
  NARROW: 0.55,
};

// UI Copy
export const UI_COPY = {
  tagline: 'Discover which prompts win. Learn. Improve. Dominate.',
  battleButton: 'Start Battle',
  voteInstruction: 'Which output better accomplishes the task?',
  afterVote: 'Thanks! Here\'s what made the difference...',
};
