"use server";

export async function myTask() {
  try {
    // TODO: Implement your server action logic here
    return {
      message: "Task completed successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}
