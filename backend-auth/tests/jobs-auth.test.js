const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Your Express app
const api = supertest(app);
const Job = require("../models/jobModel");
const User = require("../models/userModel");

const jobs = [
  {
    title: "Software Junior Developer",
    type: "Part-Time",
    description: "Web Development",
    company:{
        name:"Microsoft",
        contactEmail:"microsoft@outlook.com",
        contactPhone:"123456"
    } ,
  },

  {
    title: "Software Senior Developer",
    type: "Full-Time",
    description: "Web Development",
    company:{
        name:"Microsoft",
        contactEmail:"microsoft@outlook.com",
        contactPhone:"123456"
    } ,
  },
];

let token = null;

beforeAll(async () => {
    await User.deleteMany({});
    const result = await api.post("/api/users/signup").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      phone_number: "1234567890",
      gender: "Male",
      date_of_birth: "1990-01-01",
      membership_status: "Inactive",
    });
    token = result.body.token;
  });

  describe("Given there are initially some jobs saved", () => {
    beforeEach(async () => {
      await Job.deleteMany({});
      await Promise.all([
          api
              .post("/api/jobs")
              .set("Authorization", "bearer " + token)
              .send(jobs[0]),
          api
              .post("/api/jobs")
              .set("Authorization", "bearer " + token)
              .send(jobs[1]),
      ]);
    });
  
    it("should return all jobs as JSON when GET /api/jobs is called", async () => {
      await api
        .get("/api/jobs")
        .set("Authorization", "bearer " + token)
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });
  });
  
//   // Test GET /api/jobs
//   it("should return all jobs as JSON when GET /api/jobs is called", async () => {
//     const response = await api
//       .get("/api/jobs")
//       .expect(200)
//       .expect("Content-Type", /application\/json/);

//     expect(response.body).toHaveLength(jobs.length);
//   });

  // Test POST /api/jobs
  it("should create a new job when POST /api/jobs is called", async () => {
    const newJob = {
        title: "New Software Developer",
        type: "Part-Time",
        description: "Internship Web Development",
        company:{
            name:"Metropolia",
            contactEmail:"metropolia@outlook.com",
            contactPhone:"123456"
        }
    };
    await api
        .post("/api/jobs")
        .set("Authorization", "bearer " + token)
        .send(newJob)
        .expect(201)     
  });

//     await api
//       .post("/api/jobs")
//       .send(newJob)
//       .expect(201)
//       .expect("Content-Type", /application\/json/);

//     const jobsAfterPost = await Job.find({});
//     expect(jobsAfterPost).toHaveLength(jobs.length + 1);
//     const jobNames = jobsAfterPost.map((job) => job.name);
//     expect(jobNames).toContain(newJob.name);
//   });

  // Test GET /api/jobs/:id
  it("should return one job by ID when GET /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
      .get(`/api/jobs/${job._id}`)
      .set("Authorization", "bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  // Test PUT /api/jobs/:id
  it("should update one job with partial data when PUT /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    const updatedJob = {
        title: "UPDATED Software Senior Developer",
        description: "UPDATED Web Development"
    };  
    const response = await api
    .put(`/api/jobs/${job._id}`)
    .set("Authorization", "bearer " + token)
    .send(updatedJob)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  console.log("Response body:", response.body);

  const updatedJobCheck = await Job.findById(job._id);
  console.log("Updated job:", updatedJobCheck);

  expect(updatedJobCheck.title).toBe(updatedJob.title);
  expect(updatedJobCheck.description).toBe(updatedJob.description);
});

//     await api
//       .put(`/api/jobs/${job._id}`)
//       .send(updatedJob)
//       .expect(200)
//       .expect("Content-Type", /application\/json/);

//     const updatedJobCheck = await Job.findById(job._id);
//     expect(updatedJobCheck.title).toBe(updatedJob.title);
//     expect(updatedJobCheck.description).toBe(updatedJob.description);
//   });

//   it("should return 400 for invalid job ID when PUT /api/jobs/:id", async () => {
//     const invalidId = "12345";
//     await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
//   });

  // Test DELETE /api/jobs/:id
  it("should delete one job by ID when DELETE /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
    .delete("/api/jobs/" + job._id)
    .set("Authorization", "bearer " + token)
    .expect(204);
    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();
  });

//   it("should return 400 for invalid job ID when DELETE /api/jobs/:id", async () => {
//     const invalidId = "12345";
//     await api.delete(`/api/jobs/${invalidId}`).expect(400);
//   });
// });

afterAll(() => {
    mongoose.connection.close();
  });