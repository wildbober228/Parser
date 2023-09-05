import axios from 'axios';
import fs from 'fs'
import fetch from 'node-fetch'

import ACCESS_TOKEN_USER from './apikey.js'

 const OWNER_ID = -179502287;
 const DOMAIN = 'bread4you';

//const OWNER_ID = -87285120;
//const DOMAIN = 'club87285120';

const OWNER_ID_TO_POST = -222374382;
const BASE_URL_TO_POST = 'https://api.vk.com/method/wall.post';
const FROM_GROUP = 1;

const COUNT_POSTS = 100;
const OFFSET = 0;
const FILTER = 'all';

const BASE_URL = 'https://api.vk.com/method/wall.get';
const VERSION = '5.131'

const sendPostToGroup = (postText) => {
    fetch(`${BASE_URL_TO_POST}?access_token=${ACCESS_TOKEN_USER}&v=${VERSION}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        owner_id: OWNER_ID_TO_POST,
        from_group: FROM_GROUP,
        message: postText
  }).toString()
})
  .then((res) => res.json())
  .then(console.log)
}

const getPosts = () => {
    axios.get(`${BASE_URL}?owner_id=${OWNER_ID}&domain=${DOMAIN}&offset=${OFFSET}&count=${COUNT_POSTS}&filter=${FILTER}&access_token=${ACCESS_TOKEN_USER}&v=${VERSION}`)
    .then(resp => {
        const DataObj = [];
        resp.data.response.items.map((data) => {
            let hash = data.hash;
            let text = data.text;
            DataObj.push({[hash]: text});
        });
        //console.log(DataObj);   
        return JSON.stringify(DataObj, " ", 2);
    }).then(resp => {
        checkToWriteToFile(resp);
    });
}

const checkToWriteToFile = (posts) => {
    if (fs.existsSync("output.json")) {
        fileReader("output.json").then(
            result => {
              const oldPosts = JSON.parse(result.split(/({.*?})/).filter(s => !!s));
              const newPostsBreak = JSON.parse(posts);
              const newPosts = Object.values(newPostsBreak);

              const oldPostsKeys = [];
              oldPosts.map((keys) => oldPostsKeys.push(Object.keys(keys)[0]));
              const newPostsKeys = [];
              newPosts.map((keys) => newPostsKeys.push(Object.keys(keys)[0]));   
              
              const newResultPosts = [];
              for (let i = 0; i < newPostsKeys.length; i ++) {
                  if (!oldPostsKeys.includes(newPostsKeys[i])) {
                    let key = newPostsKeys[i];
                    newResultPosts.push(newPosts[i][key]);
                  }
              }
              console.log(newResultPosts);
              if (newResultPosts.length > 0) {
                  //add posts to the vk group
                  for (let needPosted in newResultPosts) {
                    console.log("WHANT TO POST")
                    sendPostToGroup(newResultPosts[needPosted]);
                  }
                  
                  console.log("writeToFile");
                  writeToFile(posts, "output.json");
              }
            },
            error => {
              alert("Rejected: " + error); // error - аргумент reject
            }
        );
    } else {
        console.log("writeToFile default");
        writeToFile(posts, "output.json");
    }

};

const writeToFile = (posts, fileName) => {
    fs.writeFile(fileName, posts, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    })
}

var fileReader = function (fileName) {
    return new Promise((resolve, reject) => {
        var files = fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                reject(new Error('404'));
            } else {
                resolve(data);
            }
        })
    });
}



 function sayHello(name) {
     getPosts();
 }
 setInterval(sayHello, 60000 * 5, "John")