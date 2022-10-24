const notificationTemplate = require("./adaptiveCards/notification-default.json");
const { bot } = require("./internal/initialize");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const restify = require("restify");

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// HTTP trigger to send notification. You need to add authentication / authorization for this API. Refer https://aka.ms/teamsfx-notification for more details.
server.post(
  "/api/notification",
  restify.plugins.queryParser(),
  restify.plugins.bodyParser(), // Add more parsers if needed
  async (req, res) => {
    for (const target of await bot.notification.installations()) {

    let mensagem = req.body.mensagem;
    let email = req.body.usuario;
    let jiraLink = req.body.link;

    await getMember(email, await target.members())?.sendAdaptiveCard(
        AdaptiveCards.declare(notificationTemplate).render({
          title: "Alerta de SLA!",
          appName: "Bot Sustentação",
          description: mensagem,
          notificationUrl: jiraLink
        })
      );
    }

    res.json({});
  }
);

// Bot Framework message handler.
server.post("/api/messages", async (req, res) => {
  await bot.requestHandler(req, res);
});

let getMember = (email, members) => {
  for(const member of members){
    console.log(member.account.email);
    if(member.account.email == email){
      return member;
    }
  }
  return null;
}
