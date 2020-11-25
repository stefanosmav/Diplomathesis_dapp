//// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract USAelections{
//candidate informations
struct Candidate{
uint id;
string name;
uint voteCount;
string party;
}


//given the account address that has voted => return true or false respectively
mapping(address=>bool) public isVoted;
//given an integer => return Candidate information
mapping (uint => Candidate) public candidates;
//save number of Candidates 
uint public candidatesCounter;
//declare vote event
event voteEvent(uint indexed _id);
//constructor function
constructor() public{
    addCandidate("Ντόναλντ Τραμπ","Ρεπουμπλικανικό");
    addCandidate("Τζο Μπάιντεν","Δημοκρατικό");
    }
function addCandidate(string memory _name,string memory _party) private {
    candidatesCounter ++;
    candidates[candidatesCounter]=Candidate(candidatesCounter,_name,0,_party);
}    


function vote(uint _id) public{
     
    //require that they haven't voted before
    require(!isVoted[msg.sender]);
    //requite that candidate exist
    require(_id>0 && _id<=candidatesCounter);
    //record that voter has succesfully submitted his vote
    isVoted[msg.sender]=true;
    
    //update candidates voteCount
    candidates[_id].voteCount ++;

    //emit voting event
    emit voteEvent(_id);
    
}

}