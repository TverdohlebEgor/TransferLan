Possible States of the phone:

Don't Know
Free
Working/Studing
Sleeping

When open PC_side:

communication pc -> phone [current State]

when open Phone_side

request pc -> phone [current State]

when Phone_message

send message phone -> pc
[PopUp message]

Message of UDP Format

STATE_UPDATE=FREE
STATE_UPDATE=WORKING
STATE_UPDATE=SLEEPING

STATE_REQUEST

MESSAGE=
