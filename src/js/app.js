App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    ethereum.enable();
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by MetaMask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance from Ganache
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("USAelections.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.USAelections = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.USAelections.setProvider(App.web3Provider);
      App.listenForEvents();
      App.listenForAccountChange();
      return App.mainFun();
    });
  },

  //Listen for Account change
  listenForAccountChange: function () {
    ethereum.on("accountsChanged", function (accounts) {
      App.account = accounts[0];
      App.mainFun();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.USAelections.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      instance
        .voteEvent(
          {},
          {
            fromBlock: "latest",
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("event emitted", event);
          // Reload when a new vote is recorded
          App.mainFun();
        });
    });
  },

  mainFun: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(
          "Διέυθυνση λογαριασμού τρέχοντος ψηφοφόρου: " + account
        );
      }
    });

    // Load contract data
    App.contracts.USAelections.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCounter();
      })
      .then(function (candidatesCounter) {
        // Store all promised to get candidate info
        const promises = [];
        for (var i = 1; i <= candidatesCounter; i++) {
          promises.push(electionInstance.candidates(i));
        }
        // Once all candidates are received, add to dom
        Promise.all(promises).then((candidates) => {
          var candidatesResults = $("#candidatesResults");
          candidatesResults.empty();

          var candidatesSelect = $("#candidatesSelect");
          candidatesSelect.empty();
          candidatesSelect.append(
            $("<option>", {
              text: "Επιλέξτε πρόεδρο",
              disabled: "disabled",
              selected: "true",
              name: "choosePresident",
            })
          );

          var candidatesResults2 = $("#candidatesResults2");
          candidatesResults2.empty();

          var _voteCount = 0;
          var maxvoteId = 0;
          var i = 1;
          var psifoi = [];
          var candidatesWinner = $("#candidatesWinner");
          candidatesWinner.empty();

          candidates.forEach((candidate) => {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
            var party = candidate[3];
            // Give candidate Result
            var candidateTemplate =
              "<tr><td>" +
              party +
              "</td><td>" +
              name +
              "</td><td>" +
              voteCount +
              "</td></tr>";
            candidatesResults.append(candidateTemplate);

            var candidateTemplate2 =
              "<tr><td>" + party + "</td><td>" + name + "</td></tr>";
            candidatesResults2.append(candidateTemplate2);

            // Give candidate ballot option
            var candidateOption =
              "<option value='" + id + "' >" + name + "</ option>";

            candidatesSelect.append(candidateOption);

            //winner
            if (i == 1) {
              psifoi.push(voteCount);
            }
            if (i == 2) {
              psifoi.push(voteCount);
            }

            if (voteCount > _voteCount) {
              _voteCount = voteCount;
              maxvoteId = i;
            }

            if (i == candidatesCounter) {
              if (psifoi[0].toString() == psifoi[1].toString()) {
                candidatesWinner.append("Ισοψηφία");
              } else {
                electionInstance
                  .candidates(maxvoteId)
                  .then(function (candidate) {
                    candidatesWinner.append(candidate[1]);
                  });
              }
            }
            i = i + 1;
          });
        });

        return electionInstance.isVoted(App.account);
      })
      .then(function (hasVoted) {
        var now = new Date().getTime();
        var countDownDate = new Date("Nov 4, 2021 19:00:00").getTime();

        // Do not allow a user to vote
        if (hasVoted && countDownDate - now > 0) {
          $("#pinakas1").hide();
          $("#pinakas2").show();
          $("form").hide();

          alert("Η ψήφος σας υποβλήθηκε επιτυχώς");
        }

        if (hasVoted && countDownDate - now < 0) {
          $("button").hide();
          $("label").hide();
          $("select").hide();
          $("#winner").show();
          $("#pinakas2").hide();
        }
        if (!hasVoted && countDownDate - now < 0) {
          alert("Δυστυχώς δεν προλάβατε να υποβάλλετε την ψήφο σας");
          $("button").hide();
          $("label").hide();
          $("select").hide();
          $("#winner").show();
          $("#pinakas2").hide();
        }
        if (!hasVoted && countDownDate - now > 0) {
          $("#pinakas1").hide();
          $("#pinakas2").show();
        }

        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
    //state
    var State = {
      Value1: "Alabama",
      Value2: "Alaska",
      Value3: "Arizona",
      Value4: "Arkansas",
      Value5: "California",
      Value6: "Colorado",
      Value7: "Connecticut",
      Value8: "Delaware",
      Value9: "Florida",
      Value10: "Georgia",
      Value11: "Hawaii",
      Value12: "Idaho",
      Value13: "Illinois",
      Value14: "Indiana",
      Value15: "Iowa",
      Value16: "Kansas",
      Value17: "Kentucky",
      Value18: "Louisiana",
      Value19: "Maine",
      Value20: "Maryland",
      Value21: "Massachusetts",
      Value22: "Michigan",
      Value23: "Minnesota",
      Value24: "Mississippi",
      Value25: "Missouri",
      Value26: "Montana",
      Value27: "Nebraska",
      Value28: "Nevada",
      Value29: "New Hampshire",
      Value30: "New Jersey",
      Value31: "New Mexico",
      Value32: "New York",
      Value33: "North Carolina",
      Value34: "North Dakota",
      Value35: "Ohio",
      Value36: "Oklahoma",
      Value37: "Oregon",
      Value38: "Pennsylvania",
      Value39: "Rhode Island",
      Value40: "South Carolina",
      Value41: "South Dakota",
      Value42: "Tennessee",
      Value43: "Texas",
      Value44: "Utah",
      Value45: "Vermont",
      Value46: "Virginia",
      Value47: "Washington",
      Value48: "West Virginia",
      Value49: "Wisconsin",
      Value50: "Wyoming",
    };

    var select_ = document.getElementById("voterState");
    for (index in State) {
      select_.options[select_.options.length] = new Option(State[index], index);
    }
  },

  selecState: function (a) {
    var b = document.getElementById("candidatesSelect");
    if (
      a.options[a.selectedIndex].text == "Επιλέξτε πολιτεία" &&
      b.options[b.selectedIndex].text == "Επιλέξτε πρόεδρο"
    ) {
      $("#koumpi").prop("disabled", true);
    } else if (a.options[a.selectedIndex].text == "Επιλέξτε πολιτεία") {
      $("#koumpi").prop("disabled", true);
    } else if (b.options[b.selectedIndex].text == "Επιλέξτε πρόεδρο") {
      $("#koumpi").prop("disabled", true);
    } else {
      $("#koumpi").prop("disabled", false);
    }
  },

  selecPres: function (a) {
    var b = document.getElementById("voterState");
    if (
      a.options[a.selectedIndex].text == "Επιλέξτε πρόεδρο" &&
      b.options[b.selectedIndex].text == "Επιλέξτε πολιτεία"
    ) {
      $("#koumpi").prop("disabled", true);
    } else if (b.options[b.selectedIndex].text == "Επιλέξτε πολιτεία") {
      $("#koumpi").prop("disabled", true);
    } else if (a.options[a.selectedIndex].text == "Επιλέξτε πρόεδρο") {
      $("#koumpi").prop("disabled", true);
    } else {
      $("#koumpi").prop("disabled", false);
    }
  },

  submitVote: function () {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.USAelections.deployed()
      .then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function (result) {
        // Wait for votes to update
        $("button").hide();
        $("label").hide();
        $("select").hide();
        $("#loader").show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },
}; //end of app

$(function () {
  $(window).load(function () {
    App.init();
  });
});
