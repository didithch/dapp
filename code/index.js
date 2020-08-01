//import Web3 from "web3";
//import EthCrypto from 'eth-crypto';
//import EthereumEncryption from 'ethereum-encryption';
//import cardArtifact from "../../contracts/card.json";
import SRACrypto from "./SRA/SRACrypto.js";

const App = {
  web3: null,
  keypair: null,
  keypair_array: new Array(28),
  accounts: null,
  account: null,
  card: null,
  fourplayer: null,
  p: null,
  pkey: null,
  poker: new Array(5),
  compareresult: null,
  run: null,
  round: null,
  giveup: [ false, false, false,false ],
  int2str: ["08a","09a","10a","11a","12a","13a","14a",
	    "08b","09b","10b","11b","12b","13b","14b",
	    "08c","09c","10c","11c","12c","13c","14c",
	    "08d","09d","10d","11d","12d","13d","14d","hide"],
  crypto0:	async function(){
     let SRA= new SRACrypto(4);
     var resultObj = await SRA.invoke("randomPrime", {bitLength:128, radix:16});
     var prime = resultObj.data.result;
     console.log("new readom prime: " +prime);
     
     resultObj = await SRA.invoke("randomKeypair", {"prime":prime});
     App.keypair = resultObj.data.result;
     
     console.log(JSON.stringify(App.keypair));
     
     resultObj = await SRA.invoke("randomQuadResidues", {"prime":prime, "numValues":28 });
     var cards = resultObj.data.result;
     console.log("Plaintext card text:"+ cards);

     var encCards = new Array(28);
     for(var count =0 ;count <28;count++){
     	resultObj = await SRA.invoke("encrypt",{"value":cards[count], "keypair":App.keypair});
     	encCards[count] =resultObj.data.result;
     }
     console.log("encrypted value:"+ encCards);
	  //shuffle
     for(var i=2;i<29;i++){
         let sel=Math.floor(Math.random() * i);
         if(sel != (i-1)){
	     let tmp = encCards[sel];
	     encCards[sel] =encCards[i-1];
	     encCards[i-1] = tmp;
	 }
     
     }
     console.log("shuffled value:"+ encCards);
	  console.log("prime"+ prime);
	  console.log("cards"+cards);
	  console.log("cards"+encCards);
    // await App.card.methods.enc_shuffle0(prime,cards,encCards).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:50000000});
  //  await App.card.methods.enc_shuffle0(prime,cards,encCards).send({from: App.account,value: App.web3.utils.toWei('0.06','ether') ,gasPrice:1000000000,gasLimit:100000000}) ;
     await App.card.methods.enc_shuffle0(prime,cards,encCards).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:6000000});
	  console.log("test.................");
  },
 crypto123:	async function(v,prime,shuffle){
     let SRA= new SRACrypto(4);
     
     var resultObj = await SRA.invoke("randomKeypair", {"prime":prime});
     App.keypair = resultObj.data.result;
     console.log("keypair:"+JSON.stringify(App.keypair));
     
     var encCards = new Array(28);
     for(var count =0 ;count <28;count++){
     	resultObj = await SRA.invoke("encrypt",{"value":shuffle[count], "keypair":App.keypair});
     	encCards[count] =resultObj.data.result;
     }
	  //shuffle
     for(var i=2;i<29;i++){
         let sel=Math.floor(Math.random() * i);
         if(sel != (i-1)){
	     let tmp = encCards[sel];
	     encCards[sel] =encCards[i-1];
	     encCards[i-1] = tmp;
	 }
     
     }
     console.log("shuffled value:"+ encCards);
     
     await App.card.methods.enc_shuffle123(v,prime,encCards).send({from: App.account ,gasPrice:10000000000,gasLimit:8000000});
     //await App.card.methods.enc_shuffle123(v,prime,encCards).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:8000000});
  },
  dec: async function(v,prime,shuffle){
     let SRA= new SRACrypto(4);
     var decCards = new Array(28);
     for(var count =0 ;count <28;count++){
     	var resultObj = await SRA.invoke("decrypt",{"value":shuffle[count], "keypair":App.keypair});
     	decCards[count] =resultObj.data.result;
     }
     console.log("decryped value:"+ decCards);
    
     for(var count =0 ;count <28;count++){
         var resultObj1 = await SRA.invoke("randomKeypair", {"prime":prime});
         App.keypair_array[count] = resultObj1.data.result;
     }
     console.log(App.keypair_array);
     var encCards = new Array(28);
     for(var count =0 ;count <28;count++){
     	resultObj = await SRA.invoke("encrypt",{"value":decCards[count], "keypair":App.keypair_array[count]});
     	encCards[count] =resultObj.data.result;
     }

     //if(v<3){
         await App.card.methods.dec(v,prime,encCards).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:4000000});
   //  }else if(v==3){
     //    await App.card.methods.dec(v,prime,encCards).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:1000000});
     //}
      
  },

  start: async function() {
    const  web3  = App.web3;
       
    try {
      App.accounts = await web3.eth.getAccounts();
      App.account = App.accounts[0];
	    console.log("account:"+ App.account);
	      
      $.getJSON( './contracts/card.json', function(data){ 
	     $("#jso").text( JSON.stringify(data));
      });
        setTimeout(async function(){
	    var $ffff= $("#jso").text(); //console.log($ffff); 
	    var cardArtifact =JSON.parse($ffff); //console.log("a"+cardArtifact);
            var abi=     cardArtifact["contracts"]["card.sol:card"]["abi"];
            var code=    cardArtifact["contracts"]["card.sol:card"]["bin"];
            App.card =   await new web3.eth.Contract(JSON.parse(abi))
            .deploy({data:code})
             .send({from:App.account,gasPrice:10000000000,gasLimit:5000000});
            console.log("game address:"+App.card._address); 
      // get accounts
   	    $("#game-address").text(App.card._address);
	    App.joingame1();
       },100);
             
   //  console.log("game address:"+App.card._address); 
      // get accounts
//	$("#game-address").text(App.card._address);
//	    App.joingame();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },
  joingame: async function() {
    if(App.card == null){
      App.accounts = await App.web3.eth.getAccounts();
      App.account = App.accounts[0];
	    console.log(App.accounts);
      $.getJSON( './contracts/card.json', function(data){
	     $("#jso").text( JSON.stringify(data));
      });
        setTimeout(async function(){
	    var $ffff= $("#jso").text(); 
	    var cardArtifact =JSON.parse($ffff);
            var abi= cardArtifact["contracts"]["card.sol:card"]["abi"];
            var gameaddress = prompt("address of the game");
            App.card = await new App.web3.eth.Contract(JSON.parse(abi),gameaddress);
	    console.log(App.card);
	    App.joingame1();
	},100);
    }
  },
    
  joingame1: async function() {
    App.accounts = await App.web3.eth.getAccounts();
    App.account = App.accounts[0];
    App.card.events.event_P( function(err,eventa){ console.log(parseInt(App.account,16)); console.log(parseInt(eventa.returnValues.addr,16) ); 
	    if( parseInt(eventa.returnValues.addr,16) == parseInt(App.account,16) ){
	    	App.p  = eventa.returnValues.p;
            	const player = document.getElementsByClassName("player")[0];
            	const s=Number(App.p)+1 ; 
            	player.innerHTML = "player: "+ s +" of 4";
	    }
    });
	  console.log("account:"+ App.account);
    await App.card.methods.joingame().send({from: App.account ,gasPrice:10000000000,gasLimit:8000000}) ;
    //await App.card.methods.joingame().send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:6000000}) ;
   
	 // App.p=await App.card.methods.getP().call({from:App.account});
    App.waitpoker2345event(2);
    App.waitpoker1event();
    App.wait_enc_shuffle_dec();
    App.wait_get_keypair();
    App.wait_get_keypair3();
    App.wait_get_keypair4();
    App.wait_get_keypair5();
    App.waitgiveupevent(0);
    App.waitgiveupevent(1);
    App.waitgiveupevent(2);
    App.waitgiveupevent(3);
    App.wait3giveup();
    App.gameover_before();
    App.gameover0();
    App.gameover1();
  },
 
  wait_enc_shuffle_dec: async function(){
      if(App.p == 0){
          App.card.once('event_enc_shuffle0',function(err,eventa){ console.log("aavvcc");
	      App.crypto0();
	  });
          App.card.once('event_dec0',function(err,eventa){
	      App.dec(0,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
      }else if(App.p == 1){
          App.card.once('event_enc_shuffle1',function(err,eventa){
	      App.crypto123(1,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
          App.card.once('event_dec1',function(err,eventa){
	      App.dec(1,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
      }else if(App.p == 2){
          App.card.once('event_enc_shuffle2',function(err,eventa){
	      App.crypto123(2,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
          App.card.once('event_dec2',function(err,eventa){
	      App.dec(2,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
      }else if(App.p == 3){
          App.card.once('event_enc_shuffle3',function(err,eventa){
	      App.crypto123(3,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
          App.card.once('event_dec3',function(err,eventa){
	      App.dec(3,eventa.returnValues.rand,eventa.returnValues.shuffle);
	  });
      }
  },
  wait_get_keypair: async function(){
      if(App.p == 0){
          App.card.once('event_get_keypair0',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(0,1," ",JSON.stringify(App.keypair_array[1]),JSON.stringify(App.keypair_array[2]),JSON.stringify(App.keypair_array[3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	  });
       /*   App.card.once('event_get_keypair1',async function(err,eventa){
              await App.card.methods.keypair(0,1," ",App.keypair_array[5],App.keypair_array[6],App.keypair_array[7]).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:100000000000,gasLimit:1000000});
	  }); */
      }else if(App.p == 1){
          App.card.once('event_get_keypair0',async function(err,eventa){ console.log("abctest");
              await App.card.methods.keypair(1,1,JSON.stringify(App.keypair_array[0])," ",JSON.stringify(App.keypair_array[2]),JSON.stringify(App.keypair_array[3]) ).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	  });
        /*  App.card.once('event_get_keypair1',async function(err,eventa){
              await App.card.methods.keypair(1,1,App.keypair_array[4]," ",App.keypair_array[6],App.keypair_array[7]).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:100000000000,gasLimit:1000000});
	  }); */
      }else if(App.p == 2){ 
	  App.card.once('event_get_keypair0',async function(err,eventa){   console.log("abctest");

              await App.card.methods.keypair(2,1,JSON.stringify(App.keypair_array[0]),JSON.stringify(App.keypair_array[1])," ",JSON.stringify(App.keypair_array[3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	  });
       /*   App.card.once('event_get_keypair1',async function(err,eventa){
              await App.card.methods.keypair(2,1,App.keypair_array[4],App.keypair_array[5]," ",App.keypair_array[7]).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:100000000000,gasLimit:1000000});
	  });*/
      }else if(App.p == 3){
          App.card.once('event_get_keypair0',async function(err,eventa){  console.log("abctest");
              await App.card.methods.keypair(3,1,JSON.stringify(App.keypair_array[0]),JSON.stringify(App.keypair_array[1]),JSON.stringify(App.keypair_array[2])," ").send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	  });
     /*     App.card.once('event_get_keypair1',async function(err,eventa){
              await App.card.methods.keypair(3,1,App.keypair_array[4],App.keypair_array[5],App.keypair_array[6]," ").send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:100000000000,gasLimit:1000000});

	  });*/
      }
  },

  wait_get_keypair3: async function(){
      if(App.p == 0){
          App.card.once('event_get_keypair3',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(0,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
      }else if(App.p == 1){
          App.card.once('event_get_keypair3',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(1,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:100000000000,gasLimit:500000});
	  });
      }else if(App.p == 2){
          App.card.once('event_get_keypair3',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(2,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });

     }else if(App.p == 3){
          App.card.once('event_get_keypair3',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(3,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
     }
    },	

  wait_get_keypair4: async function(){
      if(App.p == 0){
          App.card.once('event_get_keypair4',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(0,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
      }else if(App.p == 1){
          App.card.once('event_get_keypair4',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(1,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
      }else if(App.p == 2){
          App.card.once('event_get_keypair4',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(2,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });

     }else if(App.p == 3){
          App.card.once('event_get_keypair4',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(3,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
     }
    },	
	
  wait_get_keypair5: async function(){
      if(App.p == 0){
          App.card.once('event_get_keypair5',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(0,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
      }else if(App.p == 1){
          App.card.once('event_get_keypair5',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(1,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
      }else if(App.p == 2){
          App.card.once('event_get_keypair5',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(2,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });

     }else if(App.p == 3){
          App.card.once('event_get_keypair5',async function(err,eventa){ console.log("abctest");
            await  App.card.methods.keypair(3,App.round,JSON.stringify(App.keypair_array[(App.round-1)*4]),JSON.stringify(App.keypair_array[(App.round-1)*4+1]),JSON.stringify(App.keypair_array[(App.round-1)*4+2]),JSON.stringify(App.keypair_array[(App.round-1)*4+3])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:500000});
	  });
     }
    },		
    waitpoker1event: async function(){
     let SRA= new SRACrypto(4);
	  console.log("mmmmmmmmain");
     if(App.p ==0){
          App.card.once('event_keypair2player0',async function(err,eventa){
	  console.log("mmmmmmmmain0");
	  console.log(eventa.returnValues.a,eventa.returnValues.b,eventa.returnValues.c,eventa.returnValues.order,eventa.returnValues.encCard);

	      if(!err){   console.log("key0:"+eventa.returnValues.encCard +"     "+JSON.stringify(App.keypair_array[0]) ); 
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard, "keypair": App.keypair_array[0] } );
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.a) });
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.b) });
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.c) } );
                 var v;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v = count;
			 break;
		     }
		 }
		     console.log(resultObj.data.result);
		      console.log(v);
	          App.poker[0] = [Number(v),28,28,28];
		  App.display1(App.poker[0][0],App.poker[0][1],App.poker[0][2],App.poker[0][3]);
		  App.round = 2;
                  await  App.card.methods.keypair(0,2,JSON.stringify(App.keypair_array[4]),JSON.stringify(App.keypair_array[5]),JSON.stringify(App.keypair_array[6]),JSON.stringify(App.keypair_array[7])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	      }else{
	          console.error(err);
	      }
          });
      } else if(App.p ==1){
          App.card.once('event_keypair2player1',async function(err,eventa){
	  console.log("mmmmmmmmain1");  
	      if(!err){
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard, "keypair":App.keypair_array[1] });
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.a)});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.b)});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.c)});
                 var v;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v = count;
			 break;
		     }
		 }
		     console.log(resultObj.data.result);
		      console.log(v);
	          App.poker[0] = [Number(v),28,28,28];
		  App.display1(App.poker[0][0],App.poker[0][1],App.poker[0][2],App.poker[0][3]);
		  App.round = 2;
                  await  App.card.methods.keypair(1,2,JSON.stringify(App.keypair_array[4]),JSON.stringify(App.keypair_array[5]),JSON.stringify(App.keypair_array[6]),JSON.stringify(App.keypair_array[7])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	      }else{
	          console.error(err);
	      }
          });
      } else if(App.p ==2){
          App.card.once('event_keypair2player2',async function(err,eventa){
	  console.log("mmmmmmmmain2");  
	      if(!err){
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard, "keypair":App.keypair_array[2] });
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.a)});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.b)});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.c)});
                 var v;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v = count;
			 break;
		     }
		 }    console.log(resultObj.data.result);
		      console.log(v);
	          App.poker[0] = [Number(v),28,28,28];
		  App.display1(App.poker[0][0],App.poker[0][1],App.poker[0][2],App.poker[0][3]);
		  App.round = 2;
                  await  App.card.methods.keypair(2,2,JSON.stringify(App.keypair_array[4]),JSON.stringify(App.keypair_array[5]),JSON.stringify(App.keypair_array[6]),JSON.stringify(App.keypair_array[7])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
	      }else{
	          console.error(err);
	      }
          });
       } else if(App.p ==3){  
          App.card.once('event_keypair2player3',async function(err,eventa){
	  console.log("mmmmmmmmain3");  
	      if(!err){
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard, "keypair":App.keypair_array[3] } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.a)});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.b)});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.c)});
                 var v;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v = count;
			 break;
		     }
		 }
		     console.log(resultObj.data.result);
		      console.log(v);
	          App.poker[0] = [Number(v),28,28,28];
		  App.display1(App.poker[0][0],App.poker[0][1],App.poker[0][2],App.poker[0][3]);
		  App.round = 2;
                  await  App.card.methods.keypair(3,2,JSON.stringify(App.keypair_array[4]),JSON.stringify(App.keypair_array[5]),JSON.stringify(App.keypair_array[6]),JSON.stringify(App.keypair_array[7])).send({from: App.account,value: App.web3.utils.toWei('0.01','ether') ,gasPrice:10000000000,gasLimit:2000000});
                //  App.card.methods.setPoker().send({from:App.account,gasPrice:1000000000000,gasLimit:800000});
	      }else{
	          console.error(err);
	      }
           });
       }

  },
  display1: async function(a,b,c,d) {
      $(".join_game").hide();
      $("#all").show();
	  
     var aa = '<img class=\"bimg\" id=\"showhide\" src=\"https://github.com/didithch/dapp/blob/master/img/hide.gif?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
      $('#bottom').append(aa);
	  
      var bb = '<img class=\"limg\"  id=\"limg0\" src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[b] + '.jpg?raw=true\" style=\"position: relative;top:0px; left 0px;\">'
      $('#left').append(bb);

      var cc = '<img class=\"timg\" id=\"timg0\" src=\"https://github.com/didithch/dapp/blob/master/img/' + App.int2str[c] + '.gif?raw=true\"  style=\"position: relative; top: 0px; left :487px; \">'
      $('#top').append(cc);
      var dd = '<img class=\"rimg\"  id=\"rimg0\" src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[d] + '.jpg?raw=true\" style=\" position: relative; top:487px; left:0px;\" >'
      $('#right').append(dd);
      $("#showhide").mouseenter(function(){
          $('#showhide').attr('src',"https://github.com/didithch/dapp/blob/master/img/" + App.int2str[a] + ".gif?raw=true" );
          
      });
      $("#showhide").mouseleave(function(){
          $('#showhide').attr('src',"https://github.com/didithch/dapp/blob/master/img/hide.gif?raw=true");
        
      });
  },
  waitpoker2345event: async function(round){
     let SRA= new SRACrypto(4);
	  console.log("main");
     if(App.p ==0){
	  console.log("main0");
          App.card.once('event_16keypair2player',async function(err,eventa){
              if(!err){
		      console.log("a"+ eventa.returnValues.keys);
		      console.log("b"+ eventa.returnValues.order);
		      console.log("c"+ eventa.returnValues.encCard);
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[0], "keypair":JSON.parse(eventa.returnValues.keys[0]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[4]) } );
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[8]) } );
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[12] ) });
		 var v0;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v0 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[1], "keypair":JSON.parse(eventa.returnValues.keys[1]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[5])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[9])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[13])});
		 var v1;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v1 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[2], "keypair":JSON.parse(eventa.returnValues.keys[2]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[6])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[10])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[14])});
		 var v2;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v2 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[3], "keypair":JSON.parse(eventa.returnValues.keys[3]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[7])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[11])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[15])});
		 var v3;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v3 = count;
			 break;
		     }
		 }

                  App.poker[round-1] = [Number(v0), Number(v1), Number(v2), Number(v3)];
		  App.display2345(round,App.poker[round-1]);
	      console.log("ttt:"+App.poker[round-1]);
		  App.compare(round);  console.log("result:"+App.compareresult+"tt"+App.account);
		  App.card.methods.setMainplayer(App.compareresult).send({from:App.account,gasPrice:10000000000,gasLimit:500000});
		      
	      }else{
	          console.error(err);
	      }
          });
      } else if(App.p ==1){
	  console.log("main1");
          App.card.once('event_16keypair2player',async function(err,eventa){
	      if(!err){
	          console.log("a"+ eventa.returnValues.keys);
	          console.log("b"+ eventa.returnValues.order);
	          console.log("c"+ eventa.returnValues.encCard);
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[0], "keypair":JSON.parse(eventa.returnValues.keys[0]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[4])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[8])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[12])});
		 var v0;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v0 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[1], "keypair":JSON.parse(eventa.returnValues.keys[1]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[5])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[9])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[13])});
		 var v1;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v1 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[2], "keypair":JSON.parse(eventa.returnValues.keys[2]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[6])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[10])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[14])});
		 var v2;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v2 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[3], "keypair":JSON.parse(eventa.returnValues.keys[3]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[7])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[11])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[15])});
		 var v3;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v3 = count;
			 break;
		     }
		 }

                  App.poker[round-1] = [Number(v1), Number(v2), Number(v3), Number(v0)];
                  App.display2345(round,App.poker[round-1]);
	      console.log("main1ttt:"+App.poker[round-1]);
	      }else{
	          console.error(err);
	      }
          });
      } else if(App.p ==2){
	  console.log("main2");
          App.card.once('event_16keypair2player',async function(err,eventa){
	  console.log("main2");
	      if(!err){
		      console.log("a"+ eventa.returnValues.keys);
		      console.log("b"+ eventa.returnValues.order);
		      console.log("c"+ eventa.returnValues.encCard);
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[0], "keypair":JSON.parse(eventa.returnValues.keys[0]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[4])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[8])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[12])});
		 var v0;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v0 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[1], "keypair":JSON.parse(eventa.returnValues.keys[1]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[5])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[9])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[13])});
		 var v1;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v1 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[2], "keypair":JSON.parse(eventa.returnValues.keys[2]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[6])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[10])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[14])});
		 var v2;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v2 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[3], "keypair":JSON.parse(eventa.returnValues.keys[3]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[7])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[11])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[15])});
		 var v3;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v3 = count;
			 break;
		     }
		 }

                  App.poker[round-1] = [Number(v2), Number(v3), Number(v0), Number(v1)];
                  App.display2345(round,App.poker[round-1]);
	      }else{
	          console.error(err);
	      }
          });
       } else if(App.p ==3){  
	  console.log("main3");
          App.card.once('event_16keypair2player',async function(err,eventa){
	  console.log("main3");
	      if(!err){
		      console.log("a"+ eventa.returnValues.keys);
		      console.log("b"+ eventa.returnValues.order);
		      console.log("c"+ eventa.returnValues.encCard);
		 var resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[0], "keypair":JSON.parse(eventa.returnValues.keys[0]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[4])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[8])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[12])});
		 var v0;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v0 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[1], "keypair":JSON.parse(eventa.returnValues.keys[1] )} ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[5])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[9])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[13])});
		 var v1;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v1 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[2], "keypair":JSON.parse(eventa.returnValues.keys[2]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[6])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[10])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[14])});
		 var v2;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v2 = count;
			 break;
		     }
		 }
		 resultObj = await SRA.invoke("decrypt",{"value":eventa.returnValues.encCard[3], "keypair":JSON.parse(eventa.returnValues.keys[3]) } ) ;
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[7])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[11])});
                 resultObj = await SRA.invoke("decrypt",{"value":resultObj.data.result, "keypair":JSON.parse(eventa.returnValues.keys[15])});
		 var v3;
		 for(var count =0 ;count <28;count++){
		     if(eventa.returnValues.order[count]==resultObj.data.result){
		         v3 = count;
			 break;
		     }
		 }

                  App.poker[round-1] = [Number(v3), Number(v0), Number(v1), Number(v2)];
                  App.display2345(round,App.poker[round-1]);
	      }else{
	          console.error(err);
	      }
           });
       }
       App.waitmainplayerevent();
       App.waitnextplayerevent1();
       App.waitnextplayerevent2();
       App.waitnextplayerevent3();

  },
  display2345: async function(r,ss) {
     if(App.giveup[Number(App.p)] == false){	  
         if(r==6){
             $('#showhide').attr('src',"https://github.com/didithch/dapp/blob/master/img/" + App.int2str[ss[0]] + ".gif?raw=true" );
             $("#showhide").mouseleave(function(){
                 $('#showhide').attr('src',"https://github.com/didithch/dapp/blob/master/img/" + App.int2str[ss[0]] + ".gif?raw=true" );
             });
         }else{
             var aa = '<img class=\"bimg\"  src=\"https://github.com/didithch/dapp/blob/master/img/' +  App.int2str[ss[0]] + '.gif?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
             $('#bottom').append(aa);
         }
     }else {
          $('.bimg').remove(); 
          var aa = '<img class=\"bimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
         
          $('#bottom').append(aa);
     }
     
         if(App.giveup[ (Number(App.p)+1)%4 ] == false){	   
             if(r==6){
                 $('#limg0').attr('src',"https://github.com/didithch/dapp/blob/master/img-h/" + App.int2str[ss[1]] + ".jpg?raw=true" );
             }else{
                 var    dd = '<img class=\"limg\"  src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[ss[1]] + '.jpg?raw=true\" style=\"position: relative;top:0px; left 0px;\">'
                 $('#left').append(dd);
             }
         }else {	     
             $('.limg').remove(); 
             var aa = '<img class=\"limg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
         
             $('#left').append(aa);
	 }
     
     if(App.giveup[ (Number(App.p)+2)%4 ] == false){	   
         if(r==2){
             var cc1 = '<img class=\"timg\"  id=\"timg1\" src=\"https://github.com/didithch/dapp/blob/master/img/' + App.int2str[ss[2]] + '.gif?raw=true\" style=\" position: relative; top:0px; left:416px;\" >'
             var cc0 = '<img class=\"timg\"  id=\"timg0\" src=\"' + $('#timg0').attr('src') + '\" style=\" position: relative; top:0px; left:416px;\" >'
             $('#timg0').remove();  
             $('#top').append(cc1);
             $('#top').append(cc0);
         }else if(r==3){
             var cc2 = '<img  class=\"timg\"  id=\"timg2\"  src=\"https://github.com/didithch/dapp/blob/master/img/' + App.int2str[ss[2]] + '.gif?raw=true\" style=\" position: relative; top:0px; left:345px;\" >'
             var cc1 = '<img class=\"timg\"   id=\"timg1\"  src=\"' + $('#timg1').attr('src') + '\" style=\" position: relative; top:0px; left:345px;\" >'
             var cc0 = '<img  class=\"timg\"  id=\"timg0\"  src=\"' + $('#timg0').attr('src') + '\" style=\" position: relative; top:0px; left:345px;\" >'
             $('#timg0').remove(); 
             $('#timg1').remove(); 
             $('#top').append(cc2);
             $('#top').append(cc1);
             $('#top').append(cc0);
         }else if(r==4){
             var cc3 = '<img class=\"timg\"   id=\"timg3\"  src=\"https://github.com/didithch/dapp/blob/master/img/' + App.int2str[ss[2]] + '.gif?raw=true\" style=\" position: relative; top:0px; left:274px;\" >'
             var cc2 = '<img  class=\"timg\"  id=\"timg2\"  src=\"' + $('#timg2').attr('src') + '\" style=\" position: relative; top:0px; left:274px;\" >'
             var cc1 = '<img class=\"timg\"   id=\"timg1\"  src=\"' + $('#timg1').attr('src') + '\" style=\" position: relative; top:0px; left:274px;\" >'
             var cc0 = '<img class=\"timg\"   id=\"timg0\"  src=\"' + $('#timg0').attr('src') + '\" style=\" position: relative; top:0px; left:274px;\" >'
             $('#timg0').remove(); 
             $('#timg1').remove(); 
             $('#timg2').remove(); 
             $('#top').append(cc3);
             $('#top').append(cc2);
             $('#top').append(cc1);
             $('#top').append(cc0);
         }else if(r==5){
             var cc4 = '<img class=\"timg\"   id=\"timg4\"  src=\"https://github.com/didithch/dapp/blob/master/img/' + App.int2str[ss[2]] + '.gif?raw=true\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc3 = '<img class=\"timg\"   id=\"timg3\"  src=\"' + $('#timg3').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc2 = '<img  class=\"timg\"  id=\"timg2\"  src=\"' + $('#timg2').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc1 = '<img class=\"timg\"   id=\"timg1\"  src=\"' + $('#timg1').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc0 = '<img class=\"timg\"   id=\"timg0\"  src=\"' + $('#timg0').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             $('#timg0').remove(); 
             $('#timg1').remove(); 
             $('#timg2').remove(); 
             $('#timg3').remove(); 
             $('#top').append(cc4);
             $('#top').append(cc3);
             $('#top').append(cc2);
             $('#top').append(cc1);
             $('#top').append(cc0);
         }else if(r==6){
             var cc4 = '<img class=\"timg\"   id=\"timg4\"  src=\"' + $('#timg4').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc3 = '<img class=\"timg\"   id=\"timg3\"  src=\"' + $('#timg3').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc2 = '<img class=\"timg\"   id=\"timg2\"  src=\"' + $('#timg2').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc1 = '<img class=\"timg\"   id=\"timg1\"  src=\"' + $('#timg1').attr('src') + '\" style=\" position: relative; top:0px; left:203px;\" >'
             var cc0 = '<img class=\"timg\"   id=\"timg0\"  src=\"https://github.com/didithch/dapp/blob/master/img/' + App.int2str[ss[2]] + ".gif?raw=true" + '\" style=\" position: relative; top:0px; left:203px;\" >'
             $('#timg0').remove(); 
             $('#timg1').remove(); 
             $('#timg2').remove(); 
             $('#timg3').remove(); 
             $('#timg4').remove(); 
             $('#top').append(cc4);
             $('#top').append(cc3);
             $('#top').append(cc2);
             $('#top').append(cc1);
             $('#top').append(cc0);
         }
     } else {	     
             $('.timg').remove(); 
             var aa = '<img class=\"timg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
         
             $('#top').append(aa);
    }

     if(App.giveup[ (Number(App.p)+3)%4 ] == false){	   
         if(r==2){
             var bb1 = '<img   class=\"rimg\"  id=\"rimg1\" src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[ss[3]] + '.jpg?raw=true\" style=\" position: relative; top:416px; left:0px;\" >'
             var bb0 = '<img  class=\"rimg\"  id=\"rimg0\" src=\"' + $('#rimg0').attr('src') + '\" style=\" position: relative; top:416px; left:0px;\" >'
             $('#rimg0').remove(); 
             $('#right').append(bb1);
             $('#right').append(bb0);
         }else if(r==3){
             var bb2 = '<img  class=\"rimg\"  id=\"rimg2\"  src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[ss[3]] + '.jpg?raw=true\" style=\" position: relative; top:345px; left:0px;\" >'
             var bb1 = '<img  class=\"rimg\"  id=\"rimg1\"  src=\"' + $('#rimg1').attr('src') + '\" style=\" position: relative; top:345px; left:0px;\" >'
             var bb0 = '<img   class=\"rimg\" id=\"rimg0\"  src=\"' + $('#rimg0').attr('src') + '\" style=\" position: relative; top:345px; left:0px;\" >'
             $('#rimg0').remove(); 
             $('#rimg1').remove(); 
             $('#right').append(bb2);
             $('#right').append(bb1);
             $('#right').append(bb0);
         }else if(r==4){
             var bb3 = '<img   class=\"rimg\" id=\"rimg3\"  src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[ss[3]] + '.jpg?raw=true\" style=\" position: relative; top:274px; left:0px;\" >'
             var bb2 = '<img  class=\"rimg\"  id=\"rimg2\"  src=\"' + $('#rimg2').attr('src') + '\" style=\" position: relative; top:274px; left:0px;\" >'
             var bb1 = '<img  class=\"rimg\"  id=\"rimg1\"  src=\"' + $('#rimg1').attr('src') + '\" style=\" position: relative; top:274px; left:0px;\" >'
             var bb0 = '<img  class=\"rimg\"  id=\"rimg0\"  src=\"' + $('#rimg0').attr('src') + '\" style=\" position: relative; top:274px; left:0px;\" >'
             $('#rimg0').remove(); 
             $('#rimg1').remove(); 
             $('#rimg2').remove(); 
             $('#right').append(bb3);
             $('#right').append(bb2);
             $('#right').append(bb1);
             $('#right').append(bb0);
         }else if(r==5){
             var bb4 = '<img  class=\"rimg\"  id=\"rimg4\"  src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[ss[3]] + '.jpg?raw=true\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb3 = '<img  class=\"rimg\"  id=\"rimg3\"  src=\"' + $('#rimg3').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb2 = '<img  class=\"rimg\"  id=\"rimg2\"  src=\"' + $('#rimg2').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb1 = '<img  class=\"rimg\"  id=\"rimg1\"  src=\"' + $('#rimg1').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb0 = '<img   class=\"rimg\" id=\"rimg0\"  src=\"' + $('#rimg0').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             $('#rimg0').remove(); 
             $('#rimg1').remove(); 
             $('#rimg2').remove(); 
             $('#rimg3').remove(); 
             $('#right').append(bb4);
             $('#right').append(bb3);
             $('#right').append(bb2);
             $('#right').append(bb1);
             $('#right').append(bb0);
         }else if(r==6){
             var bb4 = '<img  class=\"rimg\"  id=\"rimg4\"  src=\"' + $('#rimg4').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb3 = '<img   class=\"rimg\" id=\"rimg3\"  src=\"' + $('#rimg3').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb2 = '<img  class=\"rimg\"  id=\"rimg2\"  src=\"' + $('#rimg2').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb1 = '<img  class=\"rimg\"  id=\"rimg1\"  src=\"' + $('#rimg1').attr('src') + '\" style=\" position: relative; top:203px; left:0px;\" >'
             var bb0 = '<img  class=\"rimg\" id=\"rimg0\"  src=\"https://github.com/didithch/dapp/blob/master/img-h/' + App.int2str[ss[3]] + ".jpg?raw=true" + '\" style=\" position: relative; top:203px; left:0px;\" >'
             $('#rimg0').remove(); 
             $('#rimg1').remove(); 
             $('#rimg2').remove(); 
             $('#rimg3').remove(); 
             $('#rimg4').remove(); 
             $('#right').append(bb4);
             $('#right').append(bb3);
             $('#right').append(bb2);
             $('#right').append(bb1);
             $('#right').append(bb0);
         }
     }else {	     
          $('.rimg').remove(); 
          var aa = '<img class=\"rimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
         
          $('#right').append(aa);
     }

      
  },
  compare: async function(r){
      if(r==2){
	  var ss = App.poker[1];
          var pointer=0;
          var i;
          for(i=1;i<4;i++){
             var p1 = ss[i]%7;
	     var q1 = ss[i]/7;
             var p2 = ss[pointer]%7;
	     var q2 = ss[pointer]/7;
             if(p1>p2){
                 pointer =i;	   
	     }else if(p1==p2 && q1>q2){
                 pointer =i;	   
	     }
          }
          App.compareresult = pointer;
      }else if(r==3){
	  var hand= [];
	  hand[0]= [ App.poker[1][0],App.poker[2][0] ];
	  hand[1]= [ App.poker[1][1],App.poker[2][1] ];
	  hand[2]=  [ App.poker[1][2],App.poker[2][2] ];
	  hand[3]=  [ App.poker[1][3],App.poker[2][3] ] ;
          var i;
	  var score =[];
	  for(i=0;i<4;i++){
	      if( (hand[i][0] %7) == (hand[i][1]%7) ){
		  if(hand[i][0]/7 > hand[i][1]/7){
	              score[i] = 100+10*(hand[i][0]%7) +hand[i][0]/7;
	          }else { 
	              score[i] = 100+10*(hand[i][1]%7)+hand[i][1]/7;
		  }	  
	      }else{
                  if(hand[i][0]%7 > hand[i][1]%7){
	              score[i] = 10*(hand[i][0]%7)+hand[i][0]/7;
	          }else { 
	              score[i] = 10*(hand[i][1]%7)+hand[i][1]/7;
		  }
	      }
	  }
          var p;
	  for(i=3;i>=0;i--){
	      if(App.giveup[i]==false){
	          p = i;
	      }
          }  
	  for(i=1;i<4;i++){
	      if((i!=p) && (App.giveup[i]==false )&& (score[i]>score[p])){
	          p=i;
	      }
	  }
          App.compareresult = p;
      }else if(r==4){
	  var hand= [];
	  var num= [[]];
	  num[0] = new Array(7);
	  num[1] = new Array(7);
	  num[2] = new Array(7);
	  num[3] = new Array(7);
	  num[0].fill(0);
	  num[1].fill(0);
	  num[2].fill(0);
	  num[3].fill(0);
	  var i;
	  var j;
	  var pair =[];
	  var three=[];
	  hand[0]= [ App.poker[1][0],App.poker[2][0],App.poker[3][0] ];
	  hand[1]= [ App.poker[1][1],App.poker[2][1],App.poker[3][1] ];
	  hand[2]=  [ App.poker[1][2],App.poker[2][2],App.poker[3][2] ];
	  hand[3]=  [ App.poker[1][3],App.poker[2][3],App.poker[3][3] ] ;
          
	  for(i=0;i<4;i++){
	      num[i][ hand[i][0]%7 ]++ ;
              num[i][ hand[i][1]%7 ]++ ;
              num[i][ hand[i][2]%7 ]++ ;
	  }
	  for(i=0;i<4;i++){
	      three[i] = 0;
	      pair[i] = 0;
	      for(j=0;j<7;j++){
		  if(num[i][j]==3){
		      three[i] = 1;
		  }else if(num[i][j]==2){
		      pair[i] =1;
		  }
	      }
	  }

          var score =[];
	  for(i=0;i<4;i++){
	      if(three[i]==1){
		  score[i] = 1000 + hand[i][0]%7;
	      }else if( pair[i]==1){
		  if(hand[i][0]%7 == hand[i][1]%7){
		      if(hand[i][0]/7 > hand[i][1]/7){
	                  score[i] = 100+10*(hand[i][0]%7) +hand[i][0]/7;
	              }else { 
	                  score[i] = 100+10*(hand[i][1]%7)+hand[i][1]/7;
		      }	  
	          }else if(hand[i][0]%7 == hand[i][2]%7){
		      if(hand[i][0]/7 > hand[i][2]/7){
	                  score[i] = 100+10*(hand[i][0]%7) +hand[i][0]/7;
	              }else { 
	                  score[i] = 100+10*(hand[i][2]%7)+hand[i][2]/7;
		      }	  
	          }else if(hand[i][1]%7 == hand[i][2]%7){
		      if(hand[i][1]/7 > hand[i][2]/7){
	                  score[i] = 100+10*(hand[i][1]%7) +hand[i][1]/7;
	              }else { 
	                  score[i] = 100+10*(hand[i][2]%7)+hand[i][2]/7;
		      }	  
	          }
	      }else{
		  if((hand[i][0]%7>hand[i][1]%7)&&(hand[i][0]%7>hand[i][2]%7)){
	              score[i] = 10*(hand[i][0]%7)+hand[i][0]/7;
	          }else if((hand[i][1]%7>hand[i][0]%7)&&(hand[i][1]%7>hand[i][2]%7)){
	              score[i] = 10*(hand[i][1]%7)+hand[i][1]/7;
		  }else if((hand[i][2]%7>hand[i][0]%7)&&(hand[i][2]%7>hand[i][1]%7)){
	              score[i] = 10*(hand[i][2]%7)+hand[i][2]/7;
		  }
	      }
	  }
          var p;
	  for(i=3;i>=0;i--){
	      if(App.giveup[i]==false){
	          p = i;
	      }
          }  
	  for(i=1;i<4;i++){
	      if((i!=p) && (App.giveup[i]==false )&& (score[i]>score[p])){
	          p=i;
	      }
	  } 
          App.compareresult = p;
      }else if(r==5){
	  var hand= [];
	  var num= [[]];
	  num[0] = new Array(7);
	  num[1] = new Array(7);
	  num[2] = new Array(7);
	  num[3] = new Array(7);
	  num[0].fill(0);
	  num[1].fill(0);
	  num[2].fill(0);
	  num[3].fill(0);
	  var i;
	  var j;
	  var pair =[];
	  var three=[];
	  var four=[];
	  hand[0]= [ App.poker[1][0],App.poker[2][0],App.poker[3][0] ,App.poker[4][0] ];
	  hand[1]= [ App.poker[1][1],App.poker[2][1],App.poker[3][1] ,App.poker[4][1] ];
	  hand[2]=  [ App.poker[1][2],App.poker[2][2],App.poker[3][2], App.poker[4][2] ];
	  hand[3]=  [ App.poker[1][3],App.poker[2][3],App.poker[3][3],App.poker[4][3] ] ;
          
	  for(i=0;i<4;i++){
	      num[i][ hand[i][0]%7 ]++ ;
              num[i][ hand[i][1]%7 ]++ ;
              num[i][ hand[i][2]%7 ]++ ;
              num[i][ hand[i][3]%7 ]++ ;
	  }
	  for(i=0;i<4;i++){
              four[i] =0;
	      three[i] = 0;
	      pair[i] = 0;
	      for(j=0;j<7;j++){
		  if(num[i][j]==4){
		      four[i] = 1;
		  }else if(num[i][j]==3){
		      three[i] = 1;
		  }else if(num[i][j]==2){
		      pair[i]++;
		  }
	      }
	  }

          var score =[];
	  for(i=0;i<4;i++){
	      if(four[i]==1){
		  score[i] = 100000 + hand[i][0]%7;
	      }else if(three[i]==1){
		  score[i] = 10000 + hand[i][0]%7;
	      }else if( pair[i]==2){
		  var m;
	          for(j=0;j<7;j++){
		      if(num[i][j]==2){
		          m=j;
		      }
	          }
                  var k;
		  var t=0;
		  var z=[];
		  for(k=0;k<4;k++){
	              if( hand[i][k]%7 == m ){
                          z[t] =k;
			  t++;
		      }
		  }
		  if(hand[i][z[0]]/7 >hand[i][z[1]]/7){
		      score[i]= 1000 +10*(hand[i][z[0]]%7) + hand[i][z[0]]/7;
		  }else{
		      score[i]= 1000+10*(hand[i][z[1]]%7) + hand[i][z[1]]/7;
	          }
	      }else if( pair[i]==1){
		  var m;
	          for(j=0;j<7;j++){
		      if(num[i][j]==2){
		          m=j;
		      }
	          }
                  var k;
		  var t=0;
		  var z=[];
		  for(k=0;k<4;k++){
	              if( hand[i][k]%7 == m ){
                          z[t] =k;
			  t++;
		      }
		  }
		  if(hand[i][z[0]]/7 >hand[i][z[1]]/7){
		      score[i]= 100+10*(hand[i][z[0]]%7) + hand[i][z[0]]/7;
		  }else{
		      score[i]= 100+10*(hand[i][z[1]]%7) + hand[i][z[1]]/7;
	          }
	      }else{
		  var g;
		  var q=0;
		  for(g=1;g<4;g++){
	              if(hand[i][g]%7>hand[i][q]%7){
	                  q=g;
		      }
		  }
	          score[i] = 10*(hand[i][q]%7)+hand[i][q]/7;
	      }
	  }
          var p;
	  for(i=3;i>=0;i--){
	      if(App.giveup[i]==false){
	          p = i;
	      }
          }  
	  for(i=1;i<4;i++){
	      if((i!=p) && (App.giveup[i]==false )&& (score[i]>score[p])){
	          p=i;
	      }
	  }
          App.compareresult = p;
      }else if(r==6){
	  var hand= [];
	  var num= [[]];
	  num[0] = new Array(7);
	  num[1] = new Array(7);
	  num[2] = new Array(7);
	  num[3] = new Array(7);
	  num[0].fill(0);
	  num[1].fill(0);
	  num[2].fill(0);
	  num[3].fill(0);
	  var suitCount= [[]];
	  suitCount[0] = new Array(4);
	  suitCount[1] = new Array(4);
	  suitCount[2] = new Array(4);
	  suitCount[3] = new Array(4);
	  suitCount[0].fill(0);
	  suitCount[1].fill(0);
	  suitCount[2].fill(0);
	  suitCount[3].fill(0);
	  var i;
	  var j;
	  var pair =[];
	  var three=[];
	  var four=[];
	  var isStraight=[];
	  var isFlush=[] ;
	  hand[0]= [ App.poker[0][0],App.poker[1][0],App.poker[2][0],App.poker[3][0] ,App.poker[4][0] ];
	  hand[1]= [ App.poker[0][1],App.poker[1][1],App.poker[2][1],App.poker[3][1] ,App.poker[4][1] ];
	  hand[2]= [ App.poker[0][2],App.poker[1][2],App.poker[2][2],App.poker[3][2], App.poker[4][2] ];
	  hand[3]= [ App.poker[0][3],App.poker[1][3],App.poker[2][3],App.poker[3][3],App.poker[4][3] ] ;
          
	  for(i=0;i<4;i++){
	      num[i][ hand[i][0]%7 ]++ ;
              num[i][ hand[i][1]%7 ]++ ;
              num[i][ hand[i][2]%7 ]++ ;
              num[i][ hand[i][3]%7 ]++ ;
              num[i][ hand[i][4]%7 ]++ ;
	  }
	  for(i=0;i<4;i++){
              four[i] =0;
	      three[i] = 0;
	      pair[i] = 0;
	      for(j=0;j<7;j++){
		  if(num[i][j]==4){
		      four[i] = 1;
		  }else if(num[i][j]==3){
		      three[i] = 1;
		  }else if(num[i][j]==2){
		      pair[i]++;
		  }
	      }
	  }
	  for(i=0;i<4;i++){
              suitCount[i][ Math.floor(hand[i][0]/7) ]++ ;
              suitCount[i][ Math.floor(hand[i][1]/7) ]++ ;
              suitCount[i][ Math.floor(hand[i][2]/7) ]++ ;
              suitCount[i][ Math.floor(hand[i][3]/7) ]++ ;
              suitCount[i][ Math.floor(hand[i][4]/7) ]++ ;
	  }
	  for(i=0;i<4;i++){
	      isFlush[i] = 0 ;
	      for(j=0;j<4;j++){
		  if(suitCount[i][j]==5){
	              isFlush[i] = 1 ;
		  }
	      }
          }
	  var tmp = [[]];
          tmp[0]= [ (hand[0][0]%7) ,(hand[0][1]%7) , (hand[0][2]%7) ,  (hand[0][3]%7)  , (hand[0][4]%7)  ] ;
          tmp[1]= [ (hand[1][0]%7) ,(hand[1][1]%7) , (hand[1][2]%7) ,  (hand[1][3]%7)  , (hand[1][4]%7)  ] ;
          tmp[2]= [ (hand[2][0]%7) ,(hand[2][1]%7) , (hand[2][2]%7) ,  (hand[2][3]%7)  , (hand[2][4]%7)  ] ;
          tmp[3]= [ (hand[3][0]%7) ,(hand[3][1]%7) , (hand[3][2]%7) ,  (hand[3][3]%7)  , (hand[3][4]%7)  ] ; 
          tmp[0].sort();
          tmp[1].sort();
          tmp[2].sort();
          tmp[3].sort();
	  for(i=0;i<4;i++){
	      isStraight[i]=0;
	      if(tmp[i][4]==(tmp[i][0]+4)){
	          isStraight[i] =1;
	      }
          }
          var score =[];
	  for(i=0;i<4;i++){
	      if(isStraight==1 && isFlush==1){
	          score[i] = 90000 + 10*tmp[i][4] + Math.floor(hand[i][0]/7) ;
	      }else if(four[i]==1){
		  score[i] = 80000 + hand[i][0]%7;
	      }else if(three[i]==1 && pair[i] ==1){
	          for(j=0;j<7;j++){
		      if(num[i][j]==3){
		          score[i] = 70000 + j;
		      }
	          }
	      }else if( isFlush==1){
	          score[i] = 60000 + Math.floor(hand[i][0]/7);   
	      }else if(isStraight==1 ){
	          for(j=0;j<5;j++){
                      if(hand[i][j]%7 == tmp[i][4]){
	                  score[i] = 50000 + 10*tmp[i][4] + Math.floor(hand[i][j]/7) ;
		      }
		  }
	      }else if(three[i]==1 ){
	          for(j=0;j<7;j++){
		      if(num[i][j]==3){
		          score[i] = 40000 + j;
		      }
	          }
	      }else if( pair[i]==2){
		  var m;
	          for(j=0;j<7;j++){
		      if(num[i][j]==2){
		          m=j;
		      }
	          }
                  var k;
		  var t=0;
		  var z=[];
		  for(k=0;k<5;k++){
	              if( hand[i][k]%7 == m ){
                          z[t] =k;
			  t++;
		      }
		  }
		  if(hand[i][z[0]]/7 >hand[i][z[1]]/7){
		      score[i]= 30000+10*(hand[i][z[0]]%7) + hand[i][z[0]]/7;
		  }else{
		      score[i]= 30000+10*(hand[i][z[1]]%7) + hand[i][z[1]]/7;
	          }
	      }else if( pair[i]==1){
		  var m;
	          for(j=0;j<7;j++){
		      if(num[i][j]==2){
		          m=j;
		      }
	          }
                  var k;
		  var t=0;
		  var z=[];
		  for(k=0;k<5;k++){
	              if( hand[i][k]%7 == m ){
                          z[t] =k;
			  t++;
		      }
		  }
		  if(hand[i][z[0]]/7 >hand[i][z[1]]/7){
		      score[i]= 20000+10*(hand[i][z[0]]%7) + hand[i][z[0]]/7;
		  }else{
		      score[i]= 20000+10*(hand[i][z[1]]%7) + hand[i][z[1]]/7;
	          }
	      }else{
		  var g;
		  var q=0;
		  for(g=1;g<5;g++){
	              if(hand[i][g]%7>hand[i][q]%7){
	                  q=g;
		      }
		  }
	          score[i] = 10*(hand[i][q]%7)+hand[i][q]/7;
	      }
	  }
          var p;
	  for(i=3;i>=0;i--){
	      if(App.giveup[i]==false){
	          p = i;
	      }
          }  
	  for(i=1;i<4;i++){
	      if((i!=p) && (App.giveup[i]==false )&& (score[i]>score[p])){
	          p=i;
	      }
	  }
          App.compareresult = p;
      }
  },
  waitmainplayerevent: async function(){
          App.card.once('event_main_player',function(err,eventa){
              App.run++;
		  console.log("m"+App.run);
              $('.indexmn').remove();
              if(!err){
		  if(eventa.returnValues.n ==Number(App.p) ){
                      var aa = '<button class=\"indexmn\"  style=\"position:absolute; top:500px; left:360px;\" onclick=\"App.betfunc()\">bet</button>'
                      $('#all').append(aa);
                      var bb = '<input class=\"indexmn\"  id=\"number\" style=\"position:absolute; top:525px; left:360px;\" type=\"number\" min=\"0.1\" max=\"5\" step=\"0.1\" value=\"0.1\"  >'
                      $('#all').append(bb);
		  }else if(eventa.returnValues.n ==(Number(App.p)+1)%4 ){  
                      var aa = '<p class=\"indexmn\"  style=\"position:absolute; top:370px; left:150px; color:red;\" >' + '<<<<<<<<<< bet' + '</p>'
		      $('#all').append(aa);
		  }else if(eventa.returnValues.n ==(Number(App.p)+2)%4 ){
                      var dd = '<img class=\"indexmn\"  src=\"https://github.com/didithch/dapp/blob/master/ggg1.jpg?raw=true\" style=\"position: absolute;top:120px; left :370px;\">'
                      $('#all').append(dd);
		  }else if(eventa.returnValues.n ==(Number(App.p)+3)%4 ){
                      var aa = '<p class=\"indexmn\"  style=\"position:absolute; top:370px; left:500px; color:red;\" >' +'bet>>>>>>>>>>' + '</p>'
		      $('#all').append(aa);
		  }
	      }else{
	          console.error(err);
	      }
          });
  },
  betfunc: async function(){
      await App.card.methods.transfer().send({from:App.account,gasPrice:10000000000,gasLimit:5000000,value:App.web3.utils.toWei( $('#number').val() ,'ether') });
      await App.card.methods.setnextplayer().send({from:App.account,gasPrice:10000000000,gasLimit:5000000});
  },
  waitnextplayerevent1: async function(){  console.log("1111");
          App.card.once('event1_next_player',function(err,eventa){  console.log("222");
              App.run++;
		  console.log("n"+App.run);
		  console.log("round"+App.round);
              $('.indexmn').remove();
	      if(!err){
                  if(eventa.returnValues.n == Number(App.p)){
		      if(App.giveup[Number(App.p)]==false){
                          var aa = '<button  class=\"indexmn\"  style=\"position:absolute; top:500px; left:260px;\" onclick=\"App.b0func()\">call</button>'
                          $('#all').append(aa);
                          var bb0 = '<button  class=\"indexmn\"  style=\"position:absolute; top:500px; left:360px;\" onclick=\"App.b1func()\">raise</button>'
                          $('#all').append(bb0);
                          var bb1 = '<input  class=\"indexmn\"   id=\"number\" style=\"position:absolute; top:525px; left:360px;\" type=\"number\" min=\"2\" max=\"10\" step=\"1\"  value=\"2\" >'
                          $('#all').append(bb1);
		          var bb2 = '<p  class=\"indexmn\"  style=\"position:absolute; top:525px; left:360px;\" >times</p>'
                          $('#all').append(bb2);
                          var cc = '<button   class=\"indexmn\"  style=\"position:absolute; top:500px; left:460px;\" onclick=\"App.b2func()\">fold</button>'
                          $('#all').append(cc);
		      }else {
			  App.b3func();
		      }
		  }else if( eventa.returnValues.n ==(Number(App.p)+1) %4 ){
		      if(App.giveup[(Number(App.p)+1)%4]==false){
                          var aa = '<p  class=\"indexmn\"  style=\"position:absolute; top:370px; left:150px; color:red;\" >' +'<<<<<<<<<< call,raise,fold' + '</p>'
		          $('#all').append(aa);
		      }
		  }else if( eventa.returnValues.n ==(Number(App.p)+2) %4) {
		      if(App.giveup[(Number(App.p)+2)%4]==false){
                          var dd = '<img  class=\"indexmn\"  src=\"https://github.com/didithch/dapp/blob/master/ttt1.png?raw=true\" style=\"position: absolute;top:120px; left :370px;\">'
                          $('#all').append(dd);
		      }
		  }else if(eventa.returnValues.n ==(Number(App.p)+3)%4 ){
		      if(App.giveup[(Number(App.p)+3)%4]==false){
                          var aa = '<p  class=\"indexmn\"  style=\"position:absolute; top:370px; left:450px; color:red;\" >' +'call,raise,fold >>>>>>>>>>' + '</p>'
		          $('#all').append(aa);
		      }
		  }
	      }else{
	          console.error(err);
	      }
          });	
  },


  waitnextplayerevent2: async function(){
          App.card.once('event2_next_player',function(err,eventa){
              App.run++;
		  console.log("n"+App.run);
		  console.log("round"+App.round);
              $('.indexmn').remove();
	      if(!err){
                  if(eventa.returnValues.n == Number(App.p)){
		      if(App.giveup[Number(App.p)]==false){
                          var aa = '<button  class=\"indexmn\"  style=\"position:absolute; top:500px; left:260px;\" onclick=\"App.b0func()\">call</button>'
                          $('#all').append(aa);
                          var bb0 = '<button  class=\"indexmn\"  style=\"position:absolute; top:500px; left:360px;\" onclick=\"App.b1func()\">raise</button>'
                          $('#all').append(bb0);
                          var bb1 = '<input  class=\"indexmn\"   id=\"number\" style=\"position:absolute; top:525px; left:360px;\" type=\"number\" min=\"2\" max=\"10\" step=\"1\"  value=\"2\" >'
                          $('#all').append(bb1);
		          var bb2 = '<p  class=\"indexmn\"  style=\"position:absolute; top:525px; left:360px;\" >times</p>'
                          $('#all').append(bb2);
                          var cc = '<button   class=\"indexmn\"  style=\"position:absolute; top:500px; left:460px;\" onclick=\"App.b2func()\">fold</button>'
                          $('#all').append(cc);
		      }else {
			  App.b3func();
		      }
		  }else if( eventa.returnValues.n ==(Number(App.p)+1) %4 ){
		      if(App.giveup[(Number(App.p)+1)%4]==false){
                          var aa = '<p  class=\"indexmn\"  style=\"position:absolute; top:370px; left:150px; color:red;\" >' +'<<<<<<<<< call,raise,fold' + '</p>'
		          $('#all').append(aa);
		      }
		  }else if( eventa.returnValues.n ==(Number(App.p)+2) %4) {
		      if(App.giveup[(Number(App.p)+2)%4]==false){
                          var dd = '<img  class=\"indexmn\"  src=\"https://github.com/didithch/dapp/blob/master/ttt1.png?raw=true\" style=\"position: absolute;top:120px; left :370px;\">'
                          $('#all').append(dd);
		      }
		  }else if(eventa.returnValues.n ==(Number(App.p)+3)%4 ){
		      if(App.giveup[(Number(App.p)+3)%4]==false){
                          var aa = '<p  class=\"indexmn\"  style=\"position:absolute; top:370px; left:450px; color:red;\" >' +'call,raise,fold>>>>>>>>>>' + '</p>'
		          $('#all').append(aa);
		      }
		  }
	      }else{
	          console.error(err);
	      }
          });
  },
  waitnextplayerevent3: async function(){
          App.card.once('event3_next_player',function(err,eventa){
              App.run++;
		  console.log("n"+App.run);
		  console.log("round"+App.round);
              $('.indexmn').remove();
	      if(App.run==4 && App.round<5){
                  App.run=0;
                  App.waitpoker2345event(++App.round);
	      }
	      if(!err){
                  if(eventa.returnValues.n == Number(App.p)){
		      if(App.giveup[Number(App.p)]==false){
                          var aa = '<button  class=\"indexmn\"  style=\"position:absolute; top:500px; left:260px;\" onclick=\"App.b0func()\">call</button>'
                          $('#all').append(aa);
                          var bb0 = '<button  class=\"indexmn\"  style=\"position:absolute; top:500px; left:360px;\" onclick=\"App.b1func()\">raise</button>'
                          $('#all').append(bb0);
                          var bb1 = '<input  class=\"indexmn\"   id=\"number\" style=\"position:absolute; top:525px; left:360px;\" type=\"number\" min=\"2\" max=\"10\" step=\"1\"  value=\"2\" >'
                          $('#all').append(bb1);
		          var bb2 = '<p  class=\"indexmn\"  style=\"position:absolute; top:525px; left:360px;\" >times</p>'
                          $('#all').append(bb2);
                          var cc = '<button   class=\"indexmn\"  style=\"position:absolute; top:500px; left:460px;\" onclick=\"App.b2func()\">fold</button>'
                          $('#all').append(cc);
		      }else {
			  App.b3func();
		      }
		  }else if( eventa.returnValues.n ==(Number(App.p)+1) %4 ){  //跟注,加注,放棄
		      if(App.giveup[(Number(App.p)+1)%4]==false){
                          var aa = '<p  class=\"indexmn\"  style=\"position:absolute; top:370px; left:150px; color:red;\" >' +'<<<<<<<<< call,raise,fold' + '</p>'
		          $('#all').append(aa);
		      }
		  }else if( eventa.returnValues.n ==(Number(App.p)+2) %4) {
		      if(App.giveup[(Number(App.p)+2)%4]==false){
                          var dd = '<img  class=\"indexmn\"  src=\"https://github.com/didithch/dapp/blob/master/ttt1.png?raw=true\" style=\"position: absolute;top:120px; left :370px;\">'
                          $('#all').append(dd);
		      }
		  }else if(eventa.returnValues.n ==(Number(App.p)+3)%4 ){
		      if(App.giveup[(Number(App.p)+3)%4]==false){
                          var aa = '<p  class=\"indexmn\"  style=\"position:absolute; top:370px; left:450px; color:red;\" >' +'call,raise,fold>>>>>>>>>>' + '</p>'
		          $('#all').append(aa);
		      }
		  }
	      }else{
	          console.error(err);
	      }
          });
  },
  waitgiveupevent: async function(a){
       if(a==0){
           App.card.once('event_giveup0',function(err,eventa){
               if(!err){
                   App.giveup[0] = true;
               }else{
                   console.error(err);
               }
	       if(App.giveup[Number(App.p)]==true){
                   $('.bimg').remove(); 
                   var aa = '<img class=\"bimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#bottom').append(aa);
               }   
               if(App.giveup[(Number(App.p)+1)%4]==true){
                   $('.limg').remove(); 
                   var aa = '<img class=\"limg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#left').append(aa);
               } 
               if(App.giveup[(Number(App.p)+2)%4]==true){
                   $('.timg').remove(); 
                   var aa = '<img class=\"timg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#top').append(aa);
               }
               if(App.giveup[(Number(App.p)+3)%4]==true){ 
                   $('.rimg').remove(); 
                   var aa = '<img class=\"rimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#right').append(aa);
               }

           });
       }
       if(a==1){
           App.card.once('event_giveup1',function(err,eventa){
               if(!err){
                   App.giveup[1] = true;
               }else{
                   console.error(err);
               } 
	       if(App.giveup[Number(App.p)]==true){
                   $('.bimg').remove(); 
                   var aa = '<img class=\"bimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#bottom').append(aa);
               }   
               if(App.giveup[(Number(App.p)+1)%4]==true){
                   $('.limg').remove(); 
                   var aa = '<img class=\"limg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#left').append(aa);
               } 
               if(App.giveup[(Number(App.p)+2)%4]==true){
                   $('.timg').remove(); 
                   var aa = '<img class=\"timg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#top').append(aa);
               }
               if(App.giveup[(Number(App.p)+3)%4]==true){ 
                   $('.rimg').remove(); 
                   var aa = '<img class=\"rimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#right').append(aa);
               }



           });
       }
       if(a==2){
           App.card.once('event_giveup2',function(err,eventa){
               if(!err){
                   App.giveup[2] = true;
               }else{
                   console.error(err);
               } 
	       if(App.giveup[Number(App.p)]==true){
                   $('.bimg').remove(); 
                   var aa = '<img class=\"bimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#bottom').append(aa);
               }   
               if(App.giveup[(Number(App.p)+1)%4]==true){
                   $('.limg').remove(); 
                   var aa = '<img class=\"limg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#left').append(aa);
               } 
               if(App.giveup[(Number(App.p)+2)%4]==true){
                   $('.timg').remove(); 
                   var aa = '<img class=\"timg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#top').append(aa);
               }
               if(App.giveup[(Number(App.p)+3)%4]==true){ 
                   $('.rimg').remove(); 
                   var aa = '<img class=\"rimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#right').append(aa);
               }

           });
       }
       if(a==3){
           App.card.once('event_giveup3',function(err,eventa){
               if(!err){
                   App.giveup[3] = true;
               }else{
                   console.error(err);
               } 
	       if(App.giveup[Number(App.p)]==true){
                   $('.bimg').remove(); 
                   var aa = '<img class=\"bimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#bottom').append(aa);
               }   
               if(App.giveup[(Number(App.p)+1)%4]==true){
                   $('.limg').remove(); 
                   var aa = '<img class=\"limg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#left').append(aa);
               } 
               if(App.giveup[(Number(App.p)+2)%4]==true){
                   $('.timg').remove(); 
                   var aa = '<img class=\"timg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#top').append(aa);
               }
               if(App.giveup[(Number(App.p)+3)%4]==true){ 
                   $('.rimg').remove(); 
                   var aa = '<img class=\"rimg\"  src=\"https://github.com/didithch/dapp/blob/master/giveup.jpg?raw=true\"  style=\"position: relative; top:0px; left:0px;\"  >'
                   $('#right').append(aa);
               }

           });
       }
  },
  b0func: async function(){
     // var aaa=await App.card.methods.getPreVal().call();
    //  var  bbb = aaa ;
    //  var bbb = App.web3.utils.toWei(aaa,'wei');

      var aaa=await App.card.methods.getPreVal().call();
      await App.card.methods.transfer().send({from:App.account,gasPrice:10000000000,gasLimit:5000000,value: aaa });
     
	
		  console.log("xxxround= "+App.round);
      if(App.run==0 && App.round<6){

          App.card.methods.getkeypair(App.round).send({from:App.account,gasPrice:1000000000,gasLimit:1000000});
      }else if(App.run==4 && App.round==5){
          App.card.methods.gameover().send({from:App.account,gasPrice:10000000000,gasLimit:500000});
      }else if(App.run<4){
          await App.card.methods.setnextplayer().send({from:App.account,gasPrice:10000000000,gasLimit:500000});
      }
		  console.log("addre="+App.account);
   //   var aaa=await App.card.methods.getVal(0).call();
//		  console.log("prevval0="+aaa);
  //    aaa=await App.card.methods.getVal(1).call();
//		  console.log("prevval1="+aaa);
  //    aaa=await App.card.methods.getVal(2).call();
///		  console.log("prevval2="+aaa);
   //   aaa=await App.card.methods.getVal(3).call();
//		  console.log("prevval3="+aaa);
      
  },
  b1func: async function(){
      var bbb =  Number( $('#number').val() ) ;
      //await App.card.methods.transferPreMulti(bbb).send({from:App.account,gasPrice:10000000000,gasLimit:5000000,value: 0 });
      var aaa=await App.card.methods.getPreVal().call();
      var ccc = aaa * bbb;
      await App.card.methods.transfer().send({from:App.account,gasPrice:10000000000,gasLimit:5000000,value: ccc });
      //var aaa=await App.card.methods.getPreVal().call();
      //var bbb = aaa * $('#number').val() ;
		  //console.log("prevval="+bbb);
		  console.log("xxxround= "+App.round);
      if(App.run==0 && App.round<6){
          App.card.methods.getkeypair(App.round).send({from:App.account,gasPrice:1000000000,gasLimit:1000000});
      }else if(App.run==4 && App.round==5){
          App.card.methods.gameover().send({from:App.account,gasPrice:10000000000,gasLimit:500000});
      }else if(App.run<4){
          await App.card.methods.setnextplayer().send({from:App.account,gasPrice:10000000000,gasLimit:500000});
      }
      //await App.card.methods.transfer().send({from:App.account,gasPrice:10000000000,gasLimit:5000000,value: bbb });
      
  },
  b2func: async function(){
      var i;
      var count=0;
      for(i=0;i<4;i++){
	  if(App.giveup[i] == true){
	      count++;
	  }
      }
      await App.card.methods.giveUp(App.p).send({from:App.account,gasPrice:10000000000,gasLimit:1000000 });
      if(count==2){
          App.card.methods.giveup3().send({from:App.account,gasPrice:100000000,gasLimit:500000});
      }else{
          if(App.run==0 && App.round<6){
              App.card.methods.getkeypair(App.round).send({from:App.account,gasPrice:10000000000,gasLimit:500000});
          }else if(App.run==4 && App.round==5){
              App.card.methods.gameover().send({from:App.account,gasPrice:10000000000,gasLimit:500000});
          } else if(App.run<4){
              await App.card.methods.setnextplayer().send({from:App.account,gasPrice:10000000000,gasLimit:500000});
          }
      }
  },
  b3func: async function(){  
      if(App.run==0 && App.round<6){
           App.card.methods.getkeypair(App.round).send({from:App.account,gasPrice:100000000000,gasLimit:500000});
      }else if(App.run==4 && App.round==5){
          App.card.methods.gameover().send({from:App.account,gasPrice:100000000000,gasLimit:500000});
      } else if(App.run<4){
          await App.card.methods.setnextplayer().send({from:App.account,gasPrice:100000000000,gasLimit:500000});
      }
  },
  wait3giveup: async function(){
      App.card.once('event_3giveup',function(err,eventa){
          $('.indexmn').remove();
          var i;
          var win;
          for(i=0;i<4;i++){
	      if(App.giveup[i] == false){
	          win=i;
	      }
          }
	  App.compareresult = win;
	  if(App.p==App.compareresult){
              App.card.methods.setWinner(App.compareresult).send({from:App.account,gasPrice:100000000000,gasLimit:500000});
	  }

      });
  },
  gameover_before: async function(){  console.log("aaaa");
      App.card.once('event_gameover',function(err,eventa){    console.log("bbbb");
          $('.indexmn').remove();
	  if(!err){
              App.card.methods.setpoker0(App.poker[0][0]).send({from:App.account,gasPrice:100000000000,gasLimit:500000});
          }else{
              console.error(err);
          }
      });

  },
  gameover0: async function(){
     if(App.p ==0){
          App.card.once('event1_4poker2player0',function(err,eventa){
              if(!err){
                  App.poker[0] = [eventa.returnValues.ss0, eventa.returnValues.ss1, eventa.returnValues.ss2, eventa.returnValues.ss3]
                  App.display2345(6,App.poker[0]);
		  App.compare(6); 
		      console.log("winner ="+App.compareresult);
                  App.card.methods.setWinner(App.compareresult).send({from:App.account,gasPrice:10000000000,gasLimit:5000000});
	      }else{
	          console.error(err);
	      }
          });
      } else if(App.p ==1){
          App.card.once('event1_4poker2player1',function(err,eventa){
	      if(!err){
                  App.poker[0] = [eventa.returnValues.ss0, eventa.returnValues.ss1, eventa.returnValues.ss2, eventa.returnValues.ss3]
                  App.display2345(6,App.poker[0]);
	      }else{
	          console.error(err);
	      }
          });
      } else if(App.p ==2){
          App.card.once('event1_4poker2player2',function(err,eventa){
	      if(!err){
                  App.poker[0] = [eventa.returnValues.ss0, eventa.returnValues.ss1, eventa.returnValues.ss2, eventa.returnValues.ss3]
                  App.display2345(6,App.poker[0]);
	      }else{
	          console.error(err);
	      }
          });
       } else if(App.p ==3){  
          App.card.once('event1_4poker2player3',function(err,eventa){
	      if(!err){
                  App.poker[0] = [eventa.returnValues.ss0, eventa.returnValues.ss1, eventa.returnValues.ss2, eventa.returnValues.ss3]
                  App.display2345(6,App.poker[0]);
	      }else{
	          console.error(err);
	      }
           })
       }
  },
  gameover1: async function(){
     
          App.card.once('event_winner',function(err,eventa){
              if(!err){
                  var aa = '<h1  class=\"result1\"  style=\"position:absolute; top:300px; left:200px;\" ></h1>'
                  var bb = '<h1  class=\"result2\"  style=\"position:absolute; top:400px; left:300px;\" ></h1>'
                  $('#all').append(aa);
                  $('#all').append(bb);
                  const result1 = document.getElementsByClassName("result1")[0];
                  const result2 = document.getElementsByClassName("result2")[0];
                  const s=Number(eventa.returnValues.a)+1 ; 
                  var ss = s.toString();
		  var pp = eventa.returnValues.b;
		  var gg =   App.web3.utils.fromWei( pp.toString() ,'ether' );
		  var hh = gg.toString();
                  if(App.p == (s-1)){
                      result1.innerHTML = "winner is player "+ ss +" get "+ hh +" ether";
                      result2.innerHTML = "I am winner";
		  }else{
                      result1.innerHTML = "winner is player "+ ss +" get "+ hh +" ether";
		  }
		  
	      }else{
	          console.error(err);
	      }
          });
      
  },

/*
  refreshBalance: async function() {
    const { getBalance } = this.meta.methods;
    const balance = await getBalance(this.account).call();

    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
  },*/
/*
  sendCoin: async function() {
    const amount = parseInt(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    const { sendCoin } = this.meta.methods;
    await sendCoin(receiver, amount).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshBalance();
  }, */
/*
  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },  */
};

window.App = App;

window.addEventListener("load", function() {
      $("#all").hide();
      $("#jso").hide();
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts 
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"),
    );
  }
});
