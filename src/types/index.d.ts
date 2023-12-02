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
    active: Room
}

type Room = {
    _id: string
    name: string
    users: Array<User>
    owner: User
}

type User = {
    _id: string
    username: string
    password: string
}

type userState = {
    logged: ?User
}
