const Hapi = require("hapi");
const Mongoose = require("mongoose");
const Joi = require("joi");

const PersonModel = Mongoose.model("person", {
  firstname: String,
  lastname: String
});

const init = async () => {
  const server = Hapi.Server({ host: "localhost", port: 3000 });

  await Mongoose.connect(
    "mongodb://localhost/polyglot",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    () => {
      console.log("Database server started");
    }
  );

  server.route({
    method: "POST",
    path: "/person",
    options: {
      validate: {
        payload: {
          firstname: Joi.string().required(),
          lastname: Joi.string().required()
        },
        failAction: (request, h, error) => {
          return error.isJoi
            ? h.response(error.details[0]).takeover()
            : h.response(error).takeover();
        }
      }
    },
    handler: async (request, h) => {
      try {
        const person = new PersonModel(request.payload);
        const result = await person.save();
        return h.response(result);
      } catch (error) {
        return h.response(error).code(500);
      }
    }
  });

  server.route({
    method: "GET",
    path: "/people",
    handler: async (request, h) => {
      try {
        const person = await PersonModel.find().exec();
        return h.response(person);
      } catch (error) {
        return h.response(error).code(500);
      }
    }
  });

  server.route({
    method: "GET",
    path: "/person/{id}",
    handler: async (request, h) => {
      try {
        const person = await (
          await PersonModel.findById(request.params.id)
        ).exec();
        return h.response(person);
      } catch (error) {
        return h.response(error).code(500);
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/person/{id}",
    options: {
      validate: {
        payload: {
          firstname: Joi.string().optional(),
          lastname: Joi.string().optional()
        },
        failAction: (request, h, error) => {
          return error.isJoi
            ? h.response(error.details[0]).takeover()
            : h.response(error).takeover();
        }
      }
    },
    handler: async (request, h) => {
      try {
        const result = await PersonModel.findByIdAndUpdate(
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
    path: "/person/{id}",
    handler: async (request, h) => {
      try {
        const result = await PersonModel.findByIdAndDelete(request.params.id);
        return h.response(result);
      } catch (error) {
        return h.response(error).code(500);
      }
    }
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

init();
