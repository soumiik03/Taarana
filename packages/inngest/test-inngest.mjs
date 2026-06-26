import { eventType, staticSchema } from "inngest";
const prReceivedEvent = eventType("github/pr.received", {
  schema: staticSchema()
});
console.log("has create?", typeof prReceivedEvent.create);
