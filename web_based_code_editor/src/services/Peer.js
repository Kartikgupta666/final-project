class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [{
                    urls: [
                        "stun:stun.l.google.com:19032",
                        "stun:global.stun.twilio.com:3478"
                    ]
                },
                ]
            })
        }
    }
    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(ans);
            return ans; // Return the answer SDP to be sent to the caller
        }
    }

    async setRemoteDescription(ans) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }
    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer;
        }
    }
}
// eslint-disable-next-line
export default new PeerService();