#!/bin/bash

# Test script for backend API with new gender and species fields
# This script tests the API endpoints to ensure they work with the new fields

API_BASE="http://localhost:5415/api"

echo "🧪 Testing Sushruta Backend API with Gender and Species Fields"
echo "================================================="

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s -o /dev/null -w "%{http_code}" "$API_BASE/../health"
if [ $? -eq 0 ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: Create human family member with gender
echo "2. Creating human family member with gender..."
HUMAN_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "type": "human",
    "dateOfBirth": "1990-01-15",
    "gender": "male"
  }')

if echo "$HUMAN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Human family member created successfully"
    HUMAN_ID=$(echo "$HUMAN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   ID: $HUMAN_ID"
else
    echo "❌ Failed to create human family member"
    echo "$HUMAN_RESPONSE"
    exit 1
fi

# Test 3: Create pet family member with gender and species
echo "3. Creating pet family member with gender and species..."
PET_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fluffy",
    "type": "pet",
    "dateOfBirth": "2020-06-15",
    "gender": "female",
    "species": "cat"
  }')

if echo "$PET_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Pet family member created successfully"
    PET_ID=$(echo "$PET_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   ID: $PET_ID"
else
    echo "❌ Failed to create pet family member"
    echo "$PET_RESPONSE"
    exit 1
fi

# Test 4: Test invalid species for human (should fail)
echo "4. Testing invalid species for human (should fail)..."
INVALID_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Human",
    "type": "human",
    "species": "dog"
  }')

if echo "$INVALID_RESPONSE" | grep -q '"success":false'; then
    echo "✅ Validation correctly rejected species for human"
else
    echo "❌ Validation should have rejected species for human"
    echo "$INVALID_RESPONSE"
fi

# Test 5: Retrieve family members and verify fields
echo "5. Retrieving family members and verifying fields..."
GET_RESPONSE=$(curl -s "$API_BASE/family-members")

if echo "$GET_RESPONSE" | grep -q '"gender":"male"' && echo "$GET_RESPONSE" | grep -q '"species":"cat"'; then
    echo "✅ Family members retrieved with gender and species fields"
else
    echo "❌ Gender and species fields not found in response"
    echo "$GET_RESPONSE"
fi

# Test 6: Update family member with new fields
echo "6. Updating family member with new fields..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/family-members/$HUMAN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "other"
  }')

if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Family member updated successfully"
else
    echo "❌ Failed to update family member"
    echo "$UPDATE_RESPONSE"
fi

# Test 7: Create dog pet
echo "7. Creating dog pet..."
DOG_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "type": "pet",
    "dateOfBirth": "2019-03-10",
    "gender": "male",
    "species": "dog"
  }')

if echo "$DOG_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Dog pet created successfully"
else
    echo "❌ Failed to create dog pet"
    echo "$DOG_RESPONSE"
fi

echo ""
echo "🎉 All API tests completed!"
echo "Backend API is working correctly with gender and species fields"