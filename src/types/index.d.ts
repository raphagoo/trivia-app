export type tagState = {
    all: Array
}

export type Tag = {
    category: String
    value: number
}

export type Quizz = {
    generated: Array<Question>
    activeIndex: number
    time: number
}

export type Question = {
    category: String
    id: String
    tags: Array<Tag>
    difficulty: String
    question: Object
    type: String
    answers: Array
    points: number
    difficultyColorClass: String
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
}

export type User = {
    _id: string
    username: string
    password: string
    userScore: number
}

export type userState = {
    logged: ?User
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
