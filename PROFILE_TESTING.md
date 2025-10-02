# Profile Integration Testing Guide

## How Profile Data Affects AI Responses

The Social Capital Coach uses your profile information to personalize every response. Here's how to test and see the difference:

### 🧪 **Test Scenarios**

#### **Scenario 1: First-Generation Student with Low Confidence**
**Profile Settings:**
- ✅ First-generation student: **Checked**
- Confidence Level: **Low**
- Interests: **healthcare, data science**
- Notes: **"I commute 2 hours daily, need paid internships"**

**Expected AI Behavior:**
- Extra reassurance about being first-gen
- Gentle, step-by-step guidance
- References healthcare/data science examples
- Acknowledges commute constraints
- Focuses heavily on confidence building

#### **Scenario 2: High Confidence Student**
**Profile Settings:**
- ❌ First-generation student: **Unchecked**
- Confidence Level: **High**
- Interests: **marketing, entrepreneurship**
- Notes: **"Looking for leadership opportunities"**

**Expected AI Behavior:**
- More advanced strategies
- Pushes for bigger goals
- Celebrates their readiness
- References marketing/entrepreneurship examples
- Suggests leadership-focused opportunities

### 🔍 **How to Test**

1. **Set up Profile A** (First-gen, Low confidence)
2. **Ask:** "I'm nervous about networking events"
3. **Note the response** - should be gentle, reassuring, step-by-step
4. **Change to Profile B** (High confidence)
5. **Ask the same question**
6. **Compare responses** - should be more direct, advanced strategies

### 📊 **Profile Data Flow**

```
User Profile → Chat Component → API Route → OpenAI → Personalized Response
     ↓              ↓              ↓           ↓            ↓
localStorage → JSON.stringify → System Prompt → GPT-4 → Tailored Advice
```

### 🎯 **Key Differences You Should See**

| Profile Setting | Low Confidence | High Confidence |
|----------------|----------------|-----------------|
| **Language** | Gentle, reassuring | Direct, challenging |
| **Steps** | Tiny, broken down | Larger, ambitious |
| **Examples** | Basic, accessible | Advanced, competitive |
| **Pace** | Slow, supportive | Fast, goal-oriented |

### 🚀 **Testing Commands**

Try these exact questions with different profile settings:

1. **"I don't know what to say in informational interviews"**
2. **"Should I go to the job fair?"**
3. **"I'm worried about my lack of experience"**
4. **"How do I network effectively?"**

### 💡 **Pro Tips**

- **Clear your chat** between profile changes to see clean differences
- **Update multiple profile fields** to see compound effects
- **Use specific interests** to see industry-focused advice
- **Add identity notes** to see constraint-aware suggestions

The AI will reference your specific profile data in responses, so you should see mentions of your interests, acknowledgment of your constraints, and coaching style that matches your confidence level!
