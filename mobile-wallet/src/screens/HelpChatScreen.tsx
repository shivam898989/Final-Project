import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from 'react-native';

type FAQItem = {
    question: string;
    questionHi: string;
    answer: string;
    answerHi: string;
};

type ChatMessage = {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    time: string;
};

const FAQ_DATA: FAQItem[] = [
    {
        question: 'What is a DID?',
        questionHi: 'DID क्या है?',
        answer: 'A Decentralized Identifier (DID) is your unique digital identity on the blockchain. It works like a passport — only you control it.',
        answerHi: 'DID आपकी ब्लॉकचेन पर एक विशिष्ट डिजिटल पहचान है। यह पासपोर्ट की तरह काम करता है — सिर्फ आप इसे नियंत्रित करते हैं।',
    },
    {
        question: 'How do I share a proof?',
        questionHi: 'मैं प्रमाण कैसे साझा करूं?',
        answer: 'Go to "Share Proof" tab → select proof type (income/hours) → set threshold → generate QR code. The verifier scans it without seeing your actual data.',
        answerHi: '"प्रमाण भेजें" टैब पर जाएं → प्रूफ प्रकार चुनें → सीमा सेट करें → QR कोड जेनरेट करें। सत्यापनकर्ता इसे स्कैन करता है बिना आपका वास्तविक डेटा देखे।',
    },
    {
        question: 'What is a Zero-Knowledge Proof?',
        questionHi: 'ZK प्रूफ़ क्या है?',
        answer: 'A ZK proof lets you prove something (e.g., "my income ≥ ₹10,000") without revealing the actual amount. Your privacy is fully protected.',
        answerHi: 'ZK प्रूफ़ आपको कुछ साबित करने देता है (जैसे "मेरी आय ≥ ₹10,000") बिना वास्तविक राशि बताए। आपकी गोपनीयता पूरी तरह सुरक्षित है।',
    },
    {
        question: 'How are credentials stored?',
        questionHi: 'प्रमाणपत्र कहां सुरक्षित हैं?',
        answer: 'Your credentials are stored on IPFS (decentralized storage) and anchored on the Polygon blockchain. They cannot be tampered with or deleted.',
        answerHi: 'आपके प्रमाणपत्र IPFS (विकेन्द्रीकृत स्टोरेज) पर और Polygon ब्लॉकचेन पर सुरक्षित हैं। इन्हें बदला या हटाया नहीं जा सकता।',
    },
    {
        question: 'How do I find gig work?',
        questionHi: 'मुझे गिग काम कैसे मिलेगा?',
        answer: 'Go to the "Find Gigs" tab to browse available jobs. You can filter by skill, location, and pay. Apply directly from the app.',
        answerHi: '"गिग खोजें" टैब पर जाएं। कौशल, स्थान और वेतन के अनुसार फ़िल्टर करें। ऐप से सीधे आवेदन करें।',
    },
    {
        question: 'Is my data safe?',
        questionHi: 'क्या मेरा डेटा सुरक्षित है?',
        answer: 'Yes! MDTL uses end-to-end encryption, blockchain anchoring, and zero-knowledge proofs. No one can access your personal data without your permission.',
        answerHi: 'हां! MDTL एंड-टू-एंड एन्क्रिप्शन, ब्लॉकचेन, और ZK प्रूफ़ का उपयोग करता है। बिना आपकी अनुमति के कोई भी आपका डेटा नहीं देख सकता।',
    },
];

const BOT_RESPONSES: Record<string, { en: string; hi: string }> = {
    'help': { en: 'I can help you with credentials, proofs, gigs, and wallet issues. Just ask!', hi: 'मैं प्रमाणपत्र, प्रूफ, गिग और वॉलेट संबंधी मदद कर सकता हूं। बस पूछें!' },
    'credential': { en: 'Your credentials are verifiable work certificates stored on blockchain. Go to the Credentials tab to view them.', hi: 'आपके प्रमाणपत्र ब्लॉकचेन पर संग्रहीत सत्यापित कार्य प्रमाणपत्र हैं। उन्हें देखने के लिए प्रमाणपत्र टैब पर जाएं।' },
    'proof': { en: 'To share a proof, go to Share Proof tab → select type → generate QR. No personal data is revealed!', hi: 'प्रमाण साझा करने के लिए, प्रमाण भेजें टैब पर जाएं → प्रकार चुनें → QR जेनरेट करें। कोई व्यक्तिगत डेटा नहीं दिखाया जाता!' },
    'gig': { en: 'Browse available gigs in the Find Gigs tab. Filter by skill and location to find the best match.', hi: 'गिग खोजें टैब में उपलब्ध गिग ब्राउज़ करें। सबसे अच्छा मैच खोजने के लिए कौशल और स्थान से फ़िल्टर करें।' },
    'wallet': { en: 'Your wallet stores your DID and credentials securely. Your recovery phrase is the only way to restore it — keep it safe!', hi: 'आपका वॉलेट आपकी DID और प्रमाणपत्र सुरक्षित रूप से संग्रहीत करता है। रिकवरी फ्रेज़ ही इसे पुनर्स्थापित करने का एकमात्र तरीका है!' },
    'default': { en: 'I\'m not sure about that. Try asking about credentials, proofs, gigs, or wallet. You can also check the FAQ above!', hi: 'मुझे इसके बारे में पक्का नहीं है। प्रमाणपत्र, प्रूफ, गिग, या वॉलेट के बारे में पूछें। ऊपर FAQ भी देख सकते हैं!' },
};

function getBotResponse(userMessage: string): { en: string; hi: string } {
    const msg = userMessage.toLowerCase();
    if (msg.includes('credential') || msg.includes('प्रमाणपत्र')) return BOT_RESPONSES['credential'];
    if (msg.includes('proof') || msg.includes('प्रमाण') || msg.includes('प्रूफ')) return BOT_RESPONSES['proof'];
    if (msg.includes('gig') || msg.includes('job') || msg.includes('काम') || msg.includes('गिग')) return BOT_RESPONSES['gig'];
    if (msg.includes('wallet') || msg.includes('वॉलेट') || msg.includes('did')) return BOT_RESPONSES['wallet'];
    if (msg.includes('help') || msg.includes('मदद') || msg.includes('hi') || msg.includes('hello') || msg.includes('नमस्ते')) return BOT_RESPONSES['help'];
    return BOT_RESPONSES['default'];
}

function getTimeString(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function HelpChatScreen() {
    const [activeTab, setActiveTab] = useState<'faq' | 'chat'>('faq');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 0, text: 'नमस्ते! 👋 मैं MDTL सहायक हूं।\nHello! I\'m the MDTL Help Assistant.\n\nAsk me about credentials, proofs, gigs, or wallet · प्रमाणपत्र, प्रूफ, गिग, या वॉलेट के बारे में पूछें', sender: 'bot', time: getTimeString() },
    ]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<ScrollView>(null);

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;
        const userMsg: ChatMessage = {
            id: messages.length,
            text: inputText.trim(),
            sender: 'user',
            time: getTimeString(),
        };
        const botResp = getBotResponse(inputText);
        const botMsg: ChatMessage = {
            id: messages.length + 1,
            text: `${botResp.en}\n\n${botResp.hi}`,
            sender: 'bot',
            time: getTimeString(),
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        setInputText('');
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Tab Switcher */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
                    onPress={() => setActiveTab('faq')}
                >
                    <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
                        ❓ FAQ · सवाल-जवाब
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
                    onPress={() => setActiveTab('chat')}
                >
                    <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
                        💬 Chat · चैट सहायता
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'faq' ? (
                <ScrollView style={styles.faqContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
                    <Text style={styles.faqSubtitle}>अक्सर पूछे जाने वाले सवाल</Text>

                    {FAQ_DATA.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.faqItem, expandedFAQ === index && styles.faqItemExpanded]}
                            onPress={() => toggleFAQ(index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <View style={styles.faqQuestionWrap}>
                                    <Text style={styles.faqQuestion}>{item.question}</Text>
                                    <Text style={styles.faqQuestionHi}>{item.questionHi}</Text>
                                </View>
                                <Text style={styles.faqArrow}>{expandedFAQ === index ? '▲' : '▼'}</Text>
                            </View>
                            {expandedFAQ === index && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                                    <Text style={styles.faqAnswerHi}>{item.answerHi}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Contact Section */}
                    <View style={styles.contactCard}>
                        <Text style={styles.contactTitle}>📞 Need More Help? · और मदद चाहिए?</Text>
                        <TouchableOpacity style={styles.contactRow} onPress={() => setActiveTab('chat')}>
                            <Text style={styles.contactIcon}>💬</Text>
                            <Text style={styles.contactText}>Chat with assistant · सहायक से चैट करें</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+911234567890')}>
                            <Text style={styles.contactIcon}>📱</Text>
                            <Text style={styles.contactText}>Helpline: 1800-XXX-XXXX (Toll Free)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@mdtl.in')}>
                            <Text style={styles.contactIcon}>📧</Text>
                            <Text style={styles.contactText}>support@mdtl.in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <>
                    <ScrollView
                        ref={scrollRef}
                        style={styles.chatContainer}
                        contentContainerStyle={{ paddingBottom: 10 }}
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                    >
                        {messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.msgBubble,
                                    msg.sender === 'user' ? styles.msgUser : styles.msgBot,
                                ]}
                            >
                                {msg.sender === 'bot' && <Text style={styles.msgBotLabel}>🤖 MDTL Assistant</Text>}
                                <Text style={[styles.msgText, msg.sender === 'user' && styles.msgTextUser]}>
                                    {msg.text}
                                </Text>
                                <Text style={[styles.msgTime, msg.sender === 'user' && styles.msgTimeUser]}>
                                    {msg.time}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Chat Input */}
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.chatInput}
                            placeholder="Type a message · संदेश लिखें..."
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                            <Text style={styles.sendBtnText}>➤</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        margin: 12,
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#6366F1',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    tabTextActive: { color: '#FFFFFF' },

    // FAQ
    faqContainer: { flex: 1, paddingHorizontal: 14 },
    faqTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 2, marginTop: 4 },
    faqSubtitle: { fontSize: 13, color: '#F59E0B', marginBottom: 16 },
    faqItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    faqItemExpanded: { borderColor: '#6366F1', borderWidth: 1.5 },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    faqQuestionWrap: { flex: 1, marginRight: 12 },
    faqQuestion: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    faqQuestionHi: { fontSize: 12, color: '#F59E0B' },
    faqArrow: { fontSize: 12, color: '#94A3B8' },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 12,
    },
    faqAnswerText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 8 },
    faqAnswerHi: { fontSize: 12, color: '#F59E0B', lineHeight: 18 },

    // Contact
    contactCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 18,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    contactTitle: { fontSize: 15, fontWeight: '700', color: '#6366F1', marginBottom: 14 },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    contactIcon: { fontSize: 20, marginRight: 12 },
    contactText: { fontSize: 13, color: '#475569', fontWeight: '500' },

    // Chat
    chatContainer: { flex: 1, paddingHorizontal: 14 },
    msgBubble: {
        maxWidth: '82%',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
    },
    msgBot: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderBottomLeftRadius: 4,
    },
    msgUser: {
        backgroundColor: '#6366F1',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    msgBotLabel: { fontSize: 10, color: '#6366F1', fontWeight: '700', marginBottom: 4 },
    msgText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },
    msgTextUser: { color: '#FFFFFF' },
    msgTime: { fontSize: 10, color: '#94A3B8', marginTop: 6, textAlign: 'right' },
    msgTimeUser: { color: 'rgba(255,255,255,0.7)' },

    // Input Bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#F8F9FC',
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    sendBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    sendBtnText: { fontSize: 20, color: '#FFFFFF' },
});
