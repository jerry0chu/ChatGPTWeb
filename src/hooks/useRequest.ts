import {requestAns} from "../api/config";
import {useEffect, useState} from "react";
import {ChatCompletionRequestMessage} from "openai";
import {Chat} from "../components/ChatList/ChatList";
import {useCookies} from "react-cookie";
import {openAIToken} from "../util/constanst";
import {message} from "antd";
import {MessageInstance} from "antd/es/message/interface";

interface Response {
    loading: boolean;
    systemReply: Chat
}

export default function useRequest(messages: ChatCompletionRequestMessage[], refreshCount: number, messageApi: MessageInstance): Response {
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<Chat>({content: [], role: "system"})
    const [cookies, setCookie] = useCookies([openAIToken]);
    useEffect(() => {
        if (messages.length === 0 || refreshCount === 0) return;
        if (!cookies.openAIToken) {
            console.log('openAIToken none', openAIToken)
            messageApi.open({
                type: 'error',
                content: 'please set OpenAIToken via the top right button',
            })
            return;
        }
        setLoading(true)
        requestAns(messages, cookies.openAIToken).then((res) => {
            console.log(res)
            if(!res.data){
                messageApi.error(res.data, 4)
            }
            let msg: string[] = []
            res.data.choices.forEach(item => {
                const array = item?.message?.content?.split('\n') || []
                console.log('array', array)
                for (const m of array) {
                    if (m.length > 0) {
                        msg.push(m)
                    }
                }
            })
            setChat({
                role: "system",
                content: msg
            })
            setLoading(false)
        }).catch(err => {
            messageApi.error(JSON.stringify(err.message), 4)
            setLoading(false)
        })
    }, [messages, refreshCount])

    return {loading, systemReply: chat}

}