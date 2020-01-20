const hapi = require("hapi");
const joi = require("joi");
const mongoose = require("mongoose");

const server = new hapi.Server({ host: "localhost", port: 3000 });

mongoose.connect("mongodb://localhost/dbooks", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const BookModel = mongoose.model("book", {
  title: String,
  price: Number,
  author: String,
  category: String
});

server.route({
  method: "GET",
  path: "/book",
  handler: async (request, h) => {
    try {
      let books = await BookModel.find().exec();
      return h.response(books);
    } catch (error) {
      return h.response(error).code(500);
    }
  }
});

server.route({
  method: "GET",
  path: "/book/{id}",
  handler: async (request, h) => {
    try {
      let book = await (await BookModel.findById(request.params.id)).exec();
      return h.response(book);
    } catch (error) {
      return h.response(error).code(500);
    }
  }
});

server.route({
  method: "POST",
  path: "/book",
  options: {
    validate: {
      payload: {
        title: joi.string().required(),
        price: joi.number().required(),
        author: joi.string(),
        category: joi.string().required()
      },
      failAction: (request, resp, error) => {
        return error.isJoi
          ? resp.response(error.details[0]).takeover()
          : resp.response(error).takeover();
      }
    }
  },
  handler: async (request, h) => {
    try {
      let book = new BookModel(request.payload);
      let result = await book.save();
      return h.response(result);
    } catch (error) {
      return h.response(error).code(500);
    }
  }
});

server.route({
  method: "PUT",
  path: "/book/{id}",
  options: {
    validate: {
      payload: {
        title: joi.string().optional(),
        price: joi.number().optional(),
        author: joi.optional(),
        category: joi.string().optional()
      },
      failAction: (request, resp, error) => {
        return error.isJoi
          ? resp.response(error.details[0]).takeover()
          : resp.response(error).takeover();
      }
    }
  },
  handler: async (request, h) => {
    try {
      let result = await BookModel.findByIdAndUpdate(
        request.params.id,
        request.payload,
        { new: true }
      );
      return h.response(result);
    } catch (error) {
      return h.response(error).code(500);
    }
  }
});

server.route({
  method: "DELETE",
  path: "/book/{id}",
  handler: async (request, h) => {
    try {
      let result = await BookModel.findByIdAndDelete(request.params.id);
      return h.response(result);
    } catch (error) {
      return h.response(error).code(500);
    }
  }
});

server.start(err => {
  if (err) {
    throw err;
  }

  console.log(`Server started`);
});
