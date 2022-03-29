const booksModel = require("../models/booksModel")
const bookModel = require("../models/booksModel")
const mongoose = require("mongoose")

//const ObjectId=mongoose.Types.ObjectId

const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")


const isValidRequestBody = (requestBody) => {
    return Object.keys(requestBody).length > 0
}
const isValidDate = (date) => {
    const specificDate = new Date(date).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return specificDate < today;
}

const isValid = (value) => {
    {
        if (typeof value === "undefined" || value === null)
            return false

        if (typeof value === "string" && value.trim().length === 0)
            return false
    }
    return true
}

const isValidobjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}



//CREATE BOOK API

const createBook = async function (req, res) {
    try {
      let  body = req.body

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = body

        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, msg: "Invalid request parameters, please provide valid book details" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide title" })
        }

        let isUsedTitle = await bookModel.findOne({ title, isDeleted: false })

        if (isUsedTitle) {
            return res.status(400).send({ status: false, msg: `this ${title} is already used` })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide exceprt" })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide userId" })
        }

        if (!isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid userId, please enter valid userId" })
        }

        let userDetails = await userModel.findById(userId)

        if (!userDetails) {
            return res.status(404).send({ status: false, msg: "no user found" })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide ISBN" })
        }

        let isUsedISBN = await bookModel.findOne({ ISBN })

        if (isUsedISBN) {
            return res.status(400).send({ status: false, msg: `this ${ISBN} is already used` })
        }



        //please find the regex for isbn




        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide category" })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide subCategory" })
        }

        if (!isValidDate(releasedAt)) {
            return res.status(400).send({ status: false, msg: "BAD REQUEST, please provide releasedAt details" })
        }
        else {
            let bookDetails = await bookModel.create(body)
            return res.status(201).send({ status: true, msg: "book creted successfully", data: bookDetails })
        }
    }

    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const getBook = async (req, res) => {
    try {
        const input = req.query
        const { userId, category, subcategory } = input


        // if (!((userId) || (category) || (subcategory)))

        //     return res.status(400).send({ msg: false, msg: "plase enter some data to find book" })

        // title, excerpt, userId, category, releasedAt, reviews      

        const book = await bookModel.find(input, { isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1, createdAt: 0, updatedAt: 0, subcategory: 0, __v: 0 }).sort({ title: 1 })

        if (!book) return res.send({ status: false, msg: "no such  data found" })

        return res.status(200).send({ status: true, msg: "Book lists", data: book })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}


const getById = async (req, res) => {
    try {
        const bookId = req.params.bookId //if we use params to find we use params name

        if (!bookId)

            return res.status(400).send({ status: false, msg: "please enter bookId to find the book" })

        if (!isValidobjectId(bookId))
            return res.status(400).send({ status: false, msg: "please enter valid bookId" })

        let result = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

        const findBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, reviews: 1, deletedAt: 1, releasedAt: 1, createdAt: 1, updatedAt: 1, reviewsData: result })

        if (!findBook)
            return res.status(400).send({ status: false, msg: "bookId not found please enter valid bookId" })



        return res.status(200).send({ status: false, data: findBook })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const update = async (req, res) => {
    try {
        const body = req.params.bookId
        const data = req.body
        if (!body) {
            return res.status(400).send({ status: false, msg: "please provide bookId" })

        }
        if (!isValidobjectId(body)) {
            return res.status(400).send({ status: false, msg: "please enter valid bookId" })
        }

        let validBody = await bookModel.findOne({ _id: body, isDeleted: false })
        if (!validBody) {
            return res.status(400).send({ status: false, msg: "bookId is not valid" })
        }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please enter valid data" })
        }
        //     title excerpt
        //     release date
        //  ISBN

        const { title, excerpt, releasedAt, ISBN } = data

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "please enter valid title" })
        }
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "please enter valid excerpt" })
        }
        if (!isValidDate(releasedAt)) {
            return res.status(400).send({ status: false, msg: "please enter valid releasedAt" })
        }
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "please enter valid ISBN" })
        }
        const duplicate = await bookModel.findOne({ title: title, isDeleted: false })

        const duplicateISBN = await bookModel.findOne({ ISBN: ISBN, isDeleted: false })

        if (duplicate) {
            return res.status(404).send({ status: false, msg: "title already exist " })
        }

        if (duplicateISBN) {
            return res.status(404).send({ status: false, msg: "ISBN already exist " })
        }

        const updatedData = await bookModel.findOneAndUpdate({ _id: body, isDeleted: false }, data, { new: true })

        if (!updatedData) {
            return res.status(404).send({ status: false, msg: " No such data found" })
        }
        return res.status(200).send({ status: true, msg: "Updated data successfully", data: updatedData })

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const deleteById = async (req, res) => {
    try {
        const id = req.params.bookId
        if (!id) {
            return res.status(400).send({ status: false, msg: "please provide bookId" })
        }
        if (!isValidobjectId(id)) {
            return res.status(400).send({ status: false, msg: "please provide valid bookId" })
        }

        const findBook = await bookModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })   //date.now alternative is nwe DAta
        if (!findBook) {
            return res.status(404).send({ status: false, msg: "No such data found" })
        }
        return res.status(200).send({ status: true, msg: "data successfully deleted" })

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}





module.exports.getById = getById

module.exports.getBook = getBook

module.exports.createBook = createBook

module.exports.update = update

module.exports.deleteById = deleteById




