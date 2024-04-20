export type tagState = {
    all: Array
}

export type Tag = {
    category: string
    value: number
}

export type Quizz = {
    current: ?Question
    activeIndex: number
    time: number
}

export type Question = {
    category: string
    _id: string
    tags: Array<Tag>
    difficulty: string
    question: Object
    type: string
    answers: Array
    points: number
    difficultyColorClass: string
}

export type roomState = {
    all: Array<Room>
    creating: boolean
    joining: boolean
    active: ?Room
    quizz: Quizz
}

export type Room = {
    _id: string
    name: string
    tags: string
    time: string
    inGame: boolean
    difficulties: string
    users: Array<User>
    owner: User
    currentQuestion: Question
    currentIndex: number
}

export type User = {
    _id: string
    username: string
    password: string
    userScore: number
}

export type userState = {
    logged: ?User
    register: errorState
    login: errorState
}

export type errorState = {
    error: boolean
    message: string
}

export type payloadAnswer = {
    correct: boolean
    answerCorrectId: string
    userId: string
}

export type payloadJoinLeaveRoom = {
    user: User
    room: string
}

export type generatedQuizz = {
    questions: Array<Question>
    time: string
}

export type Answer = {
    _id: string
    correct: boolean
    answer: string
    question: Question
}
