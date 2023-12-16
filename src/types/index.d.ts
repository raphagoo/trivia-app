type tagState = {
    all: Array
}

type Tag = {
    category: String
    value: number
}

type Quizz = {
    generated: Array<Question>
    activeIndex: number
    time: number
}

type Question = {
    category: String
    id: String
    tags: Array
    difficulty: String
    question: Object
    answers: Array
    type: String
    answers: Array
    points: number
    difficultyColorClass: String
}

type roomState = {
    all: Array<Room>
    creating: boolean
    joining: boolean
    active: ?Room
    quizz: Quizz
}

type Room = {
    _id: string
    name: string
    tags: string
    time: string
    inGame: boolean
    difficulties: string
    users: Array<User>
    owner: User
}

type User = {
    _id: string
    username: string
    password: string
    userScore: number
}

type userState = {
    logged: ?User
}

type payloadAnswer = {
    correct: boolean
    userId: string
}

type generatedQuizz = {
    questions: Array<Question>
    time: string
}
