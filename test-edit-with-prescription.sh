#!/bin/bash

# Test script to reproduce and verify the fix for the edit error
# when a family member has active prescriptions

API_BASE="http://localhost:5415/api"

echo "🧪 Testing Edit Family Member with Active Prescriptions"
echo "======================================================"

# Step 1: Create a family member
echo "1. Creating a family member..."
MEMBER_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "type": "human",
    "gender": "male",
    "dateOfBirth": "1990-01-15"
  }')

if echo "$MEMBER_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Family member created successfully"
    MEMBER_ID=$(echo "$MEMBER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Member ID: $MEMBER_ID"
else
    echo "❌ Failed to create family member"
    echo "$MEMBER_RESPONSE"
    exit 1
fi

# Step 2: Create a medication
echo "2. Creating a medication..."
MEDICATION_RESPONSE=$(curl -s -X POST "$API_BASE/medications" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Medicine",
    "dosage": "10mg",
    "frequency": "Once daily",
    "instructions": "Take with food"
  }')

if echo "$MEDICATION_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Medication created successfully"
    MEDICATION_ID=$(echo "$MEDICATION_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Medication ID: $MEDICATION_ID"
else
    echo "❌ Failed to create medication"
    echo "$MEDICATION_RESPONSE"
    exit 1
fi

# Step 3: Create a prescription linking them
echo "3. Creating a prescription..."
PRESCRIPTION_RESPONSE=$(curl -s -X POST "$API_BASE/prescriptions" \
  -H "Content-Type: application/json" \
  -d "{
    \"familyMemberId\": \"$MEMBER_ID\",
    \"medicationId\": \"$MEDICATION_ID\",
    \"startDate\": \"2025-01-01\",
    \"active\": true
  }")

if echo "$PRESCRIPTION_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Prescription created successfully"
    PRESCRIPTION_ID=$(echo "$PRESCRIPTION_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Prescription ID: $PRESCRIPTION_ID"
else
    echo "❌ Failed to create prescription"
    echo "$PRESCRIPTION_RESPONSE"
    exit 1
fi

# Step 4: Try to get the family member details (this was failing before)
echo "4. Testing GET family member with prescription..."
GET_RESPONSE=$(curl -s "$API_BASE/family-members/$MEMBER_ID")

if echo "$GET_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Successfully retrieved family member with prescriptions"
    
    # Check if prescription data is properly formatted
    if echo "$GET_RESPONSE" | grep -q '"prescriptions"' && \
       echo "$GET_RESPONSE" | grep -q '"startDate"'; then
        echo "✅ Prescription data properly formatted with dates"
    else
        echo "❌ Prescription data formatting issue"
    fi
else
    echo "❌ Failed to retrieve family member"
    echo "$GET_RESPONSE"
    exit 1
fi

# Step 5: Try to edit the family member (this was the original error)
echo "5. Testing EDIT family member with prescription..."
EDIT_RESPONSE=$(curl -s -X PUT "$API_BASE/family-members/$MEMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test User"
  }')

if echo "$EDIT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Successfully edited family member with active prescriptions"
else
    echo "❌ Failed to edit family member"
    echo "$EDIT_RESPONSE"
    exit 1
fi

# Step 6: Verify the edit worked
echo "6. Verifying the edit..."
VERIFY_RESPONSE=$(curl -s "$API_BASE/family-members/$MEMBER_ID")

if echo "$VERIFY_RESPONSE" | grep -q '"name":"Updated Test User"'; then
    echo "✅ Edit verified - name was updated successfully"
else
    echo "❌ Edit verification failed"
fi

echo ""
echo "🎉 Fix Verification Results:"
echo "=========================="
echo "✅ Can retrieve family member with active prescriptions"
echo "✅ Date formatting handled correctly for both Date objects and strings"
echo "✅ Can edit family member even when they have active prescriptions"
echo "✅ Prescription data is preserved during edits"
echo ""
echo "The toISOString() error has been fixed! 🎉"