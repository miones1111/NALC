/* eslint-disable jsx-a11y/no-redundant-roles */
import React , {useState , useEffect} from 'react';
import axios from 'axios';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane , faPlus , faRightFromBracket, faRobot , faUser} from '@fortawesome/free-solid-svg-icons'

function Home() {
    const [input, setInput] = useState('');
    const [chatName , setChatName] = useState('');    
    const [chats , setChats] = useState([]);
    const [threadId , setThreadId] = useState('');
    const [chatMsg , setChatMsg] = useState([]);
    const reversedChats = chats.slice().reverse();

    const handleInputChange = (identifier) => (e) => {
      if (identifier === "input") {
        setInput(e.target.value);
      } else if (identifier === "chat") {
        setChatName(e.target.value);
      }
      // Add more conditions for additional inputs
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/threads/');
      setChats(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const fetchMsg = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/messages/thread/${threadId}/`);
      const messages = response.data.map(message => {
        const messageText = JSON.parse(message.message_text);
        const user = messageText.query; // Extracting 'query' from JSON string
        let text = messageText.response; // Extracting 'result' from JSON string
  
        // Assuming the text is a research paper string, split it into an array
        if (text) {
          text = text.split('\\n').filter(Boolean);
        }
  
        return {
          user,
          text,
        };
      });
      setChatMsg(messages);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleCreateChat = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/threads/', {
        thread_name: chatName,
      });

      alert("Chat Created!");
      setChatName('');
      fetchChats(); // Refresh the chat list after creating a new chat
    } catch (error) {
      alert("Something Went Wrong, Try Again!");
      console.error('Error:', error);
    }
  };

  const handleChat = async (id) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/threads/${id}/`);
      setThreadId(id, () => {
        fetchMsg();
      });      
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    if (threadId !== null) {
      fetchMsg();
    }
  }, [threadId]);

  useEffect(() => {
    fetchChats(); // Fetch chats on component mount
  }, []);

  // useEffect(() => {
  //   fetchMsg();
  // }, []);

    const handleSendMessage = (id) => {
      if (input.trim() === '') {
        // Display error or handle accordingly
      } else {
        axios.post('http://127.0.0.1:8000/api/messages/create/', {
          thread_id: threadId,
          query: input,
        })
          .then(function (response) {
            // Handle success
            fetchMsg();
            setInput('');
          })
          .catch(function (error) {
            // Handle error
            console.log(error);
          });
      }
    };

  return (
    <div className="container-fluid gx-0">
      {/* Modal */}
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">New Chat</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form class="row g-3 needs-validation">
                <div class="col">
                  <input type="text" class="form-control" id="validationCustom03" value={chatName} placeholder='Chat Name'required onChange={handleInputChange("chat")}/>
                </div>
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handleCreateChat}>Create</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Side Bar */}
      <div className="chat-sidebar">
        <button type="button" class="btn btn-outline-light newChatBtn" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            <FontAwesomeIcon icon={faPlus} style={{ color: "#ffffff" }} />
            <span style={{ marginLeft: "5px" }}>New Chat</span>
        </button>
        <button class="btn  logoutBtn" type="button">
            <FontAwesomeIcon icon={faRightFromBracket} style={{color: "#ffffff",}} />
            <span style={{ marginLeft: "5px" , color: "white"}}>Log Out</span>
        </button>
        <br/>
        <br/>
        <div style={{ overflowY: 'scroll', height: '600px' }}>
          {reversedChats.map(chat => (
            <div key={chat.thread_id}>
              <button
                className="btn btn-warning"
                role="button"
                aria-disabled="true"
                style={{ width: '100%', display: 'block', marginBottom: '10px' }}
                onClick={() => handleChat(chat.thread_id)}
              >
                {chat.thread_name}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Convo Page */}
      <div className="chat-input">
        <div className='convo'>
          <div style={{ overflowY: 'scroll', height: '600px' }}>
            {chatMsg.map((message, index) => (
              <div key={index} style={{ marginBottom: '10px', padding: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', fontSize: '20px' }}>
                <FontAwesomeIcon icon={faUser} style={{ color: "#000000", marginRight: '5px', textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)' }} /> : {message.user}<br />
                <br />
                <FontAwesomeIcon icon={faRobot} style={{ color: "rgb(132, 24, 24)", marginRight: '5px', textShadow: '1px 1px 1px rgba(132, 24, 24, 0.5)' }} /> : 
                {Array.isArray(message.text) ? (
                  message.text.map((paper, i) => (
                    <div key={i}>{paper}</div>
                  ))
                ) : (
                  message.text
                )}
              </div>
            ))}
          </div>
        </div>
        <div className='inputForm'>
            <div className="input-group mb-1">
                <input type="text" className="form-control" aria-label="Recipient's username" aria-describedby="button-addon2" value={input} onChange={handleInputChange("input")} onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}/>
                <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleSendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} style={{color: "#841818",}} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;