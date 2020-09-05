import React, { Component } from "react";
import io from "socket.io-client";

import {connect} from "react-redux"
import "./chat.css";
import Picker from 'emoji-picker-react';



let endPoint = "http://localhost:5000";
export const socket = io.connect(`${endPoint}`);


let global_var

class Chat extends Component {
    state = {
        message: "",
        messages: [],
        chit:[],
        hostNumber : [],
        chosenEmoji : ""
    }

    OnTextChange = (e) => {
        this.setState({...this.state, message : e.target.value})
    }

    componentDidMount(){
        // socket.on('connect', () => {
        //     socket.send("server connected")
        // })

        socket.on("join", data => {
            let msg  = data.msg
            this.setState({...this.state, messages : [...this.state.messages, msg]})
        })
        socket.on("message", (data) => {
            console.log(data)
            let msg  = data.username + " : " + data.msg
            this.setState({...this.state, messages : [...this.state.messages, msg]})
            

        })

        socket.on('chits', (data) => {
            console.log(data)
            this.setState({...this.state, chit : data.chit})
        })

        socket.on('start', (data) => {
            console.log("start", data.msg)
            this.setState({...this.state, hostNumber : [...this.state.hostNumber, data.msg]})
        })
    }

    onSendMessage = () => {
        console.log(this.props.room)
//        socket.emit('join', {'name' : this.props.name, 'room' : this.props.room})
        socket.send({ 'msg' : this.state.message, 'name' :  this.props.name, 'room' : this.props.room})
    }

    stop = () => {
        console.log("inside stop")
        clearInterval(global_var)
    }

    start = () => {
        console.log("emited")        
        socket.emit('start', {'room' : this.props.room})
    }

    onStart = () => {
        global_var = setInterval(this.start, 3600);
    }

    getChit = () => {
        socket.emit('chits')
    }

    changeColor = (e) => {
        console.log(e.target.id)
        let id = e.target.id
        console.log(document.getElementById(id).style.backgroundColor == 'white')
        if (document.getElementById(id).style.backgroundColor == 'white'){
            document.getElementById(id).style.textDecoration = "line-through"
            document.getElementById(id).style.backgroundColor = "Red"   
        }
        else{
            document.getElementById(id).style.backgroundColor = 'white'
            document.getElementById(id).style.textDecoration = "none"

        }
    }

    onEmojiClick = (event, emojiObject) => {
        this.setState({...this.state, chosenEmoji : emojiObject})
      };

    render(){
        console.log(" Number is : ", this.state.hostNumber)
        return(
            <div className = "game">
                <div className = "tambola">
                <div style = {{margin: "50px"}}>  
                    <button className = "number-generator">{this.state.hostNumber[this.state.hostNumber.length - 1]}</button>
                </div>
                    
                <p><button onClick = {this.getChit}>chit</button></p>
                <p><button onClick = {this.onStart}>Start</button></p>
                <div className = "chit">
                    <div>
                    {this.state.chit.map(num => {
                        console.log(this.state.chit.indexOf(num))
                        return(
                        <button id = {"id" + this.state.chit.indexOf(num)} className = "chit_numbers" onClick = {(e) => this.changeColor(e)}>{num}</button>
                        )
                    })}
                    </div>
                       
                </div>
            </div>
            <div className = "chat">
                <p style= {{textAlign: "center"}}>
                    <h2>CHAT ROOM</h2>
                    <h4>Hi {this.props.name}</h4>
                </p>
                
                <div>
                    {this.state.messages.map(msg => {
                        return(
                        <p className = "chat-container">{msg}</p>
                        )
                    })}
                </div>

                <p className = "Send-Message"><input onChange = {(e) => this.OnTextChange(e)}></input>
                <button onClick = {this.onSendMessage}>Send</button></p>
                <div>
                <div>
                    {this.state.chosenEmoji ? (
                    <span>You chose: {this.state.chosenEmoji.emoji}</span>
                    ) : (
                        <span>No emoji Chosen</span>
                    )}
                        <Picker onEmojiClick={this.onEmojiClick} />
                    </div>
                 </div>
      
            </div>

        </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log(state);
    return {
        count_state : state.Increment.count,
        name : state.user.name,
        room : state.user.room
    }
}

export default connect(mapStateToProps)(Chat)
