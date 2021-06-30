interface Question {
  questionType: number;
  questionText: string;
  questionSelect: {
    questionChoice: string[];
  };
}

interface Answers {
  [outWalletAnswer: string]: string;
}
