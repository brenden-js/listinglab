import Chat from "@/components/chat";
import {Resource} from "sst";

const topic = 'sst-chat'
export default function Test() {
    return (
        <div>
                    <Chat topic={`${Resource.App.name}/${Resource.App.stage}/${topic}`} endpoint={Resource.MyRealtime.endpoint} authorizer={Resource.MyRealtime.authorizer} />
        </div>
    )
}