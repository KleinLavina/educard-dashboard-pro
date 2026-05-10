# Teacher-Parent Communication Model

## Overview
EduCard Pro uses a **contact exchange model** instead of an in-app chat system for teacher-parent communication.

## How It Works

### For Parents
Parents can view their children's teachers' contact information:
- **Mobile Phone Number**: For calls and SMS
- **Facebook Messenger**: Primary free communication channel
- **Facebook Profile**: For direct messages
- **Email Address**: For formal communication

### For Teachers
Teachers can view their students' parents' contact information:
- **Mobile Phone Number**: For urgent matters
- **Facebook Messenger**: Primary communication channel
- **Facebook Profile**: For direct messages
- **Email Address**: For formal communication

## Communication Channels

### 1. Facebook Messenger (Primary)
- **Cost**: Free
- **Speed**: Instant
- **Best For**: Quick updates, questions, daily communication
- **Platform**: Meta Cloud API integration

### 2. SMS (Fallback)
- **Cost**: ₱0.50 per message
- **Speed**: Instant
- **Best For**: Parents without Messenger, urgent alerts
- **Platform**: Semaphore API integration

### 3. Phone Calls
- **Cost**: Standard carrier rates
- **Speed**: Immediate
- **Best For**: Urgent matters, detailed discussions
- **Platform**: Direct contact

### 4. Email
- **Cost**: Free
- **Speed**: Varies
- **Best For**: Formal communication, documentation
- **Platform**: School email system

## Benefits of This Approach

### 1. Simplicity
- No need to learn a new chat interface
- Uses familiar platforms (Messenger, SMS, email)
- Reduces training requirements

### 2. Flexibility
- Parents and teachers choose their preferred method
- Communication happens on platforms they already use
- No need to check another app

### 3. Cost-Effective
- No chat infrastructure to maintain
- No message storage requirements
- Leverages existing free platforms

### 4. Privacy & Control
- Direct communication between parties
- No platform monitoring required
- Users control their own conversations

### 5. Reliability
- Uses established, reliable platforms
- No dependency on custom chat system
- Fallback options available

## User Interface

### Parent View
**Teacher Contact Information Card**
- Teacher photo/avatar
- Name and role
- Subject/section taught
- Which children they teach
- Contact methods with copy-to-clipboard buttons:
  - Phone (with icon)
  - Messenger (with icon)
  - Facebook (with icon)
  - Email (with icon)
- Note about contacting directly

### Teacher View (To Be Implemented)
**Student/Parent Contact Information**
- Parent name
- Student(s) they're parent of
- Contact methods with copy-to-clipboard buttons
- Note about professional communication

## Automated Notifications

While direct communication uses external platforms, the system still sends automated notifications:

### Attendance Alerts
- Sent via Messenger (primary) or SMS (fallback)
- Triggered when student scans ID card
- Includes time-in/time-out information

### Grade Notifications
- Sent when new grades are posted
- Includes subject, grade, and status
- Links to view full details

### Conduct Alerts
- Sent for positive recognition or concerns
- Includes description and date
- Allows parent to follow up with teacher

### Absence Alerts
- Sent for prolonged absences
- Includes attendance percentage
- Prompts parent to contact teacher

## Implementation Notes

### Copy-to-Clipboard Feature
- One-click copy for all contact information
- Toast notification confirms copy
- Makes it easy to paste into Messenger, SMS, etc.

### Contact Information Management
- Teachers update their own contact info in settings
- Parents update their own contact info in settings
- School admin can view/verify contact information
- Privacy settings allow hiding certain contact methods

### Professional Guidelines
- System includes note about professional communication
- Recommended response times displayed
- Best practices for each communication method
- Escalation path for urgent matters

## Future Enhancements (Optional)

### 1. Contact Verification
- Verify phone numbers via SMS code
- Verify Messenger via test message
- Verify email via confirmation link

### 2. Communication Logs
- Optional: Log when contact info was accessed
- Track communication frequency (metadata only)
- Help identify communication gaps

### 3. Preferred Method Indicator
- Teachers/parents mark preferred contact method
- System highlights preferred method
- Improves response rates

### 4. Quick Actions
- "Message on Messenger" button (opens Messenger app)
- "Call Now" button (opens phone dialer)
- "Send Email" button (opens email client)

## Security & Privacy

### Data Protection
- Contact information encrypted at rest
- Access logged for security
- Only relevant parties can view contacts

### Privacy Controls
- Users can hide specific contact methods
- Option to show/hide from specific roles
- Temporary "Do Not Disturb" mode

### Professional Boundaries
- Guidelines for appropriate communication times
- Escalation process for concerns
- Admin oversight available if needed

## Status: ✅ Implemented (Parent View)
- Parent view shows teacher contact information
- Copy-to-clipboard functionality working
- Toast notifications for copy actions
- Professional note included

## Next Steps
- Implement teacher view with parent contact information
- Add contact information management in settings
- Create admin view for contact verification
- Add communication guidelines page
