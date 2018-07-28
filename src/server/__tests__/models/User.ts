import "jest";
import { createSampleUser } from "../../helpers/FakeFactory";
import User from "../../models/User";

describe("User mongoose model tests:", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("Can create and save an instance to Mongo, verify by ID", async () => {
    const newUser = createSampleUser();
    await newUser.save();
    const loadedFromDb = await User.findById(newUser._id);

    expect(newUser._id).toEqual(loadedFromDb._id);
    expect(newUser.fullName).toEqual(loadedFromDb.fullName);
  });

  test("Hashes new user passwords, not saved as plaintext", async () => {
    const newUser = createSampleUser();
    newUser.password = "I'm a password";
    await newUser.save();
    const loadedFromDb = await User.findById(newUser._id).select("password");
    // Should exist as a field
    expect(loadedFromDb.password).toBeTruthy();
    // Should not be the same string
    expect(loadedFromDb.password === "I'm a password").toBeFalsy();
    // Should be a really long hash
    expect(loadedFromDb.password.length).toBeGreaterThan(20);
  });

  test("Two users with same passwords have different hashes", async () => {
    const userOne = createSampleUser("email@test.com");
    const userTwo = createSampleUser("email2@test.com");
    userOne.password = userTwo.password = "Similar passwords";

    await userOne.save();
    await userTwo.save();

    expect(userOne.password).toBeTruthy();
    expect(userTwo.password).toBeTruthy();
    expect(userOne.password === userTwo.password).toBeFalsy();
  });

  test("User password comparison successfully authenticates a right password", async () => {
    const user = createSampleUser();
    user.password = "This is a password";

    await user.save();

    const passwordComparison = await user.comparePassword("This is a password");
    expect(passwordComparison).toBeTruthy();
  });

  test("User password comparison rejects a wrong password", async () => {
    const user = createSampleUser();
    user.password = "This is a password";

    await user.save();

    const passwordComparison = await user.comparePassword("This is a wrong password");
    expect(passwordComparison).toBeFalsy();
  });
});
