// client/src/components/chat/ChatWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem, ListItemText, Button, Stack } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

// Định nghĩa sẵn các câu trả lời của Bot
const botScripts = {
  'Đăng ký': 'Chào bạn, nếu bạn gặp vấn đề khi đăng ký, hãy thử kiểm tra email trong hòm thư Spam (Thư rác). Nếu hệ thống báo email đã tồn tại, bạn có thể dùng chức năng "Quên mật khẩu" nhé.',
  'Đăng nhập': 'Chào bạn, nếu không đăng nhập được, vui lòng kiểm tra lại Caps Lock. Nếu bạn đã bật xác thực 2 lớp (2FA), hãy chắc chắn bạn nhập đúng mã OTP được gửi đến email.',
  'Quên mật khẩu': 'Chào bạn, bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập. Email chứa link đặt lại mật khẩu sẽ được gửi đến bạn, vui lòng kiểm tra cả hòm thư Spam nhé.',
  'default': 'Xin lỗi, tôi chưa được lập trình để hiểu câu hỏi này. Bạn có thể chọn một trong các vấn đề dưới đây hoặc liên hệ bộ phận hỗ trợ qua email phutung06@gmail.com nhé.',
};

// Menu tùy chọn chính
const mainMenuOptions = [
  'Đăng ký',
  'Đăng nhập',
  'Quên mật khẩu',
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Tin nhắn chào mừng và các tùy chọn ban đầu
  const initialMessage = {
    sender: 'bot',
    text: 'Vietbando xin chào! Bạn cần hỗ trợ về vấn đề gì ạ?',
    options: mainMenuOptions
  };

  const [messages, setMessages] = useState([initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (sender, text, options = []) => {
    setMessages(prev => [...prev, { sender, text, options }]);
  };

  const handleBotResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    let responseKey = 'default';

    if (lowerCaseMessage.includes('đăng ký')) {
      responseKey = 'Đăng ký';
    } else if (lowerCaseMessage.includes('đăng nhập') || lowerCaseMessage.includes('otp')) {
      responseKey = 'Đăng nhập';
    } else if (lowerCaseMessage.includes('quên mật khẩu') || lowerCaseMessage.includes('mật khẩu')) {
      responseKey = 'Quên mật khẩu';
    }
    
    // Giả lập bot đang "suy nghĩ"
    setTimeout(() => {
      addMessage('bot', botScripts[responseKey], mainMenuOptions);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage('user', inputValue);
      handleBotResponse(inputValue);
      setInputValue('');
    }
  };

  const handleOptionClick = (option) => {
    // Hiển thị lựa chọn của user như một tin nhắn
    addMessage('user', option);
    // Bot trả lời dựa trên lựa chọn
    setTimeout(() => {
      addMessage('bot', botScripts[option], mainMenuOptions);
    }, 500);
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 350,
            height: 500,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'black' }}>
            <Typography sx={{fontWeight: 400, fontSize: '1.125rem', lineHeight: 1.6, color: 'white'}}
                >Hỗ trợ trực tuyến</Typography>
          </Box>
          
          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {messages.map((msg, index) => (
              // ListItem giờ chỉ có nhiệm vụ là một container cho mỗi lượt chat
              <ListItem key={index} sx={{ p: 0, flexDirection: 'column', mb: 2 }}>

                {/* --- KHỐI TIN NHẮN VĂN BẢN --- */}
                <Box sx={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', // Dùng alignSelf để tự căn lề
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.200',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    p: '8px 12px',
                    borderRadius: '16px',
                    maxWidth: '80%',
                    mb: 1
                }}>
                  <ListItemText
                    primary={msg.text}
                    primaryTypographyProps={{ sx: { color: 'inherit' } }}
                  />
                </Box>
                
                {/* --- KHỐI CÁC NÚT LỰA CHỌN --- */}
                {msg.options && msg.options.length > 0 && (
                   <Stack 
                     spacing={1} 
                     sx={{ 
                       mt: 1, 
                       width: '50%',
                       alignSelf: 'flex-end' // Dùng alignSelf để tự căn lề phải
                     }}
                   >
                     {msg.options.map((option, i) => (
                       <Button key={i} variant="outlined" size="small" onClick={() => handleOptionClick(option)}>
                         {option}
                       </Button>
                     ))}
                   </Stack>
                )}
              </ListItem>
            ))}
             <div ref={messagesEndRef} />
          </List>

          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Nhập tin nhắn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <IconButton color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;