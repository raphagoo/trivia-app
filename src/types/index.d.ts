type tagState = {
    status: object
    all: Array
}

type Tag = {
    category: String
    value: number
}

type quizzState = {
    generated: Array<Question>
    activeIndex: number
    userScore: number
}

type Question = {
    category: String
    id: String
    tags: Array
    difficulty: String
    question: Object
    correctAnswer: String
    incorrectAnswers: Array
    type: String
    answers: Array
    points: number
    difficultyColorClass: String
}
