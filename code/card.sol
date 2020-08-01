pragma solidity ^0.5.12;
pragma experimental ABIEncoderV2;

//import "oraclizeAPI_0.5.sol";
import "Strings.sol";
import "Integers.sol";
//import "StringUtilsLib.sol";
//import "github.com/didithch/dapp/blob/master/oraclizeAPI_0.5.sol";
//import "http://github.com/oraclize/ethereum-api/oraclizeAPI.sol";
contract card  {
    using Strings for string;
    using Integers for uint;
    struct bal {
        uint total;
        uint current;
    }
    mapping(address=>bal) balance;
    string publickey ;
    bool[4] giveup;
    address [4] player;
    uint[28] poker;
    uint[4] poker0;
    uint p;
    uint gameoverp;
    uint pointer;
    uint m_player;
    uint n_player;
    string[28] order;
    string[28] shuffle_cards;
    string[4] keypair0;
    string[4] keypair1;
    string[4] keypair2;
    string[4] keypair3;
    bool[4] full;
 
    event poker2player0(string s);
    event poker2player1(string s);
    event poker2player2(string s);
    event poker2player3(string s);

    event event_4poker2player0(string ss0,string ss1,string ss2,string ss3);
    event event_4poker2player1(string ss0,string ss1,string ss2,string ss3);
    event event_4poker2player2(string ss0,string ss1,string ss2,string ss3);
    event event_4poker2player3(string ss0,string ss1,string ss2,string ss3);
    event event1_4poker2player0(uint ss0,uint ss1,uint ss2,uint ss3);
    event event1_4poker2player1(uint ss0,uint ss1,uint ss2,uint ss3);
    event event1_4poker2player2(uint ss0,uint ss1,uint ss2,uint ss3);
    event event1_4poker2player3(uint ss0,uint ss1,uint ss2,uint ss3);
        
    event event_gameover();

    event event_main_player(uint n);
    event event1_next_player(uint n);
    event event2_next_player(uint n);
    event event3_next_player(uint n);

    event event_giveup0();
    event event_giveup1();
    event event_giveup2();
    event event_giveup3();
    event event_3giveup();
    event event_winner(uint a,uint b);
    
    event event_enc_shuffle0();
    event event_enc_shuffle1(string rand,string[28] shuffle);
    event event_enc_shuffle2(string rand,string[28] shuffle);
    event event_enc_shuffle3(string rand,string[28] shuffle);
    event event_dec0(string rand,string[28] shuffle);
    event event_dec1(string rand,string[28] shuffle);
    event event_dec2(string rand,string[28] shuffle);
    event event_dec3(string rand,string[28] shuffle);
    event event_get_keypair0();
    event event_get_keypair3();
    event event_get_keypair4();
    event event_get_keypair5();
            
    event event_keypair2player0(string a,string b,string c,string[28] order,string encCard);
    event event_keypair2player1(string a,string b,string c,string[28] order,string encCard);
    event event_keypair2player2(string a,string b,string c,string[28] order,string encCard);
    event event_keypair2player3(string a,string b,string c,string[28] order,string encCard);
    event event_16keypair2player(string[16] keys,string[28] order,string[4] encCard);
    event event_P(address addr,uint p);        
    //event event_P(string addr,uint p);        
  

event event_tmp(string s);

    constructor () public  {
      poker=[0,7,14,21,
             1,4,2,22,
             15,8,16,23,
             24,10,17,3,
             9,11,18,25,
             5,12,19,26,
             6,13,20,27 ];
        p = 0;
        gameoverp =0;
        pointer=0;
        giveup = [false,false,false,false];
        full = [false,false,false,false];
    }  
function toAsciiString(address x) pure public returns (string memory ) {
    bytes memory s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
        byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        byte hi = byte(uint8(b) / 16);
        byte lo = byte(uint8(b) - 16 * uint8(hi));
        s[2*i] = char(hi);
        s[2*i+1] = char(lo);            
    }
    return string(s);
}

function char(byte b) pure public  returns (byte c) {
    if (uint8(b) < 10) return byte(uint8(b) + 0x30);
    else return byte(uint8(b) + 0x57);
}
    function joingame() public payable returns(uint a){

        uint i;
        for(i=0;i<p;i++){
            assert(player[i] != msg.sender);
        }
        //assert(player[p] == address(0));
        player[p] = msg.sender;
        balance[msg.sender].current = 0;
        balance[msg.sender].total = 0;
        emit event_P(msg.sender,p);        
        //emit event_P(toAsciiString(msg.sender),p);        
        p++;
        if(p==4){
           
            emit event_enc_shuffle0();
        }
        return 4;
    }
    function enc_shuffle0(string memory rand,string[28] memory ord, string[28] memory shuffle)  public payable {
        order = ord;
        emit event_enc_shuffle1(rand,shuffle);
    }
    function enc_shuffle123(uint v, string memory rand,string[28] memory shuffle)  public payable  {
        if(v==1){
            emit event_enc_shuffle2(rand,shuffle);
        }else if(v==2){
            emit event_enc_shuffle3(rand,shuffle);
        }else if(v==3){
            emit event_dec0(rand,shuffle);
        }
    }
    function dec(uint v, string memory rand,string[28] memory shuffle) public payable {
        if(v==0){
            emit event_dec1(rand,shuffle);
        }else if(v==1){
            emit event_dec2(rand,shuffle);
        }else if(v==2){
            emit event_dec3(rand,shuffle);
        }else if(v==3){
            shuffle_cards = shuffle;
            emit event_get_keypair0();
        }
    }
    function getkeypair(uint round) public payable{
         if(round ==3){
            emit event_get_keypair3();
         }else if(round ==4){
            emit event_get_keypair4();
         }else if(round ==5){
            emit event_get_keypair5();
         }
    }
    function keypair(uint user,uint round,string memory a,string memory b,string memory c,string memory d)public payable{
        full[user] =true;
        if(user==0 ){
            keypair0 = [a,b,c,d];
        }if(user==1 ){
            keypair1 = [a,b,c,d];
        }if(user==2 ){
            keypair2 = [a,b,c,d];
        }if(user==3 ){
            keypair3 = [a,b,c,d];
        }           
                                                                      //1   [1,0,1,1]
                                                                                          //2   [1,1,0,1]
        if((full[0]==true) && (full[1]==true) && (full[2]==true) && (full[3]==true) ){    //3   [1,1,1,0]
            full=[false,false,false,false];
            if(round==1){
                emit event_keypair2player0(keypair1[0],keypair2[0],keypair3[0],order, shuffle_cards[0]);
                emit event_keypair2player1(keypair0[1],keypair2[1],keypair3[1],order, shuffle_cards[1]);
                emit event_keypair2player2(keypair0[2],keypair1[2],keypair3[2],order, shuffle_cards[2]);
                emit event_keypair2player3(keypair0[3],keypair1[3],keypair2[3],order, shuffle_cards[3]);
            }else if((round==2) || (round==3) ||(round==4) || (round==5)){
                emit event_16keypair2player( [ keypair0[0],keypair0[1],keypair0[2],keypair0[3],
                                               keypair1[0],keypair1[1],keypair1[2],keypair1[3],
                                               keypair2[0],keypair2[1],keypair2[2],keypair2[3],
                                               keypair3[0],keypair3[1],keypair3[2],keypair3[3] ],
                                               order,
                                               [shuffle_cards[(round-1)*4] ,shuffle_cards[(round-1)*4+1],shuffle_cards[(round-1)*4+2],shuffle_cards[(round-1)*4+3]] 
                                             );
            }
        }
    }

  /*  function getP() view public returns(uint) {
         
        uint i;
        for(i=0;i<p;i++){
            if(player[i] == msg.sender){
                return i; 
            }
        }
        assert(false); 
    } */

    function getPreVal() public view returns(uint){
        uint  nn = n_player;
        do{
            if(nn == 0 ){
                nn=3;
            }else{
                nn =  nn - 1 ;
            }
        } while (giveup[nn] == true) ;
        return balance[ player[nn] ].current ;

    }
   // function getVal(uint dd) public view returns(uint){
     //   return balance[ player[dd] ].current ;

    //}
    function setMainplayer(uint pp)  public {
        m_player = pp;
        n_player = pp;
        emit event_main_player(pp);
    }

    function setnextplayer()  public {
        n_player = (++ n_player) % 4;
        if(n_player ==  (m_player+1)%4) {
            emit event1_next_player(n_player);
        }else if(n_player ==  (m_player+2)%4) {
            emit event2_next_player(n_player);
        }else if(n_player ==  (m_player+3)%4) {
            emit event3_next_player(n_player);
        }
    }



    function transfer() public payable {
        assert((msg.sender == player[0]) || (msg.sender == player[1]) ||
              (msg.sender == player[2]) || (msg.sender == player[3]));
        balance[msg.sender].current = msg.value;
        balance[msg.sender].total += msg.value;
    }

    function transferPreMulti(uint ee) public payable {
        assert((msg.sender == player[0]) || (msg.sender == player[1]) ||
              (msg.sender == player[2]) || (msg.sender == player[3]));
        uint  nn = n_player;
        do{
            if(nn == 0 ){
                nn=3;
            }else{
                nn =  nn - 1 ;
            }
        } while (giveup[nn] == true) ;
        uint vv = balance[ player[nn] ].current * ee ;
        balance[msg.sender].current = vv ;
        balance[msg.sender].total += vv ;
    }


    function  giveUp(uint a) public  {
        giveup[a] = true;

        if(a==0){
            emit event_giveup0();
        }else if(a==1){
            emit event_giveup1();
        }else if(a==2){
            emit event_giveup2();
        }else if(a==3){
            emit event_giveup3();
        }
    }
    function setpoker0(uint n) public {
        if(msg.sender==player[0]){
            poker0[0] = n;
            gameoverp++;
        }else if(msg.sender==player[1]){
            poker0[1] = n;
            gameoverp++;
        }else if(msg.sender==player[2]){
            poker0[2] = n;
            gameoverp++;
        }else if(msg.sender==player[3]){
            poker0[3] = n;
            gameoverp++;
        }
        if(gameoverp==4){
            emit event1_4poker2player0(poker0[0],poker0[1],poker0[2],poker0[3]);
            emit event1_4poker2player1(poker0[1],poker0[2],poker0[3],poker0[0]);
            emit event1_4poker2player2(poker0[2],poker0[3],poker0[0],poker0[1]);
            emit event1_4poker2player3(poker0[3],poker0[0],poker0[1],poker0[2]);
        }
    }
    function gameover() public {
        emit event_gameover();
    }
    function giveup3() public {
        emit event_3giveup();
    }
    function setWinner(uint a) public  {
        uint total =   balance[player[0]].total+ balance[player[1]].total+balance[player[2]].total+balance[player[3]].total;
       address payable ddd = address(uint160(player[a])); 
       ddd.transfer(total);

        emit event_winner(a,total);
    }
    function uint2string(uint a) public pure returns(string memory){
        if(a==0) return "0";
        else if(a==1) return "1";
        else if(a==2) return "2";
        else if(a==3) return "3";
    }
    function bool2string(bool a) public pure returns(string memory){
        if(a==true) {return "1";
        } else if(a==false){ return "0";}
    }
    function substr(string memory str, uint  startIndex, uint  endIndex)  public pure returns (string memory ) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }
}
