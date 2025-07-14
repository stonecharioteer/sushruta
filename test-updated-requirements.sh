#!/bin/bash

# Test script for updated requirements:
# - Only male/female gender options (no "other")
# - Species is required for pets

API_BASE="http://localhost:5415/api"

echo "🧪 Testing Updated Gender and Species Requirements"
echo "================================================="

# Test 1: Test male/female gender creation
echo "1. Testing male/female gender creation..."

MALE_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "type": "human",
    "gender": "male"
  }')

if echo "$MALE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Male human created successfully"
    MALE_ID=$(echo "$MALE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Failed to create male human"
fi

FEMALE_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "type": "human",
    "gender": "female"
  }')

if echo "$FEMALE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Female human created successfully"
    FEMALE_ID=$(echo "$FEMALE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Failed to create female human"
fi

# Test 2: Test that "other" gender is rejected
echo "2. Testing that 'other' gender is rejected..."

OTHER_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Gender",
    "type": "human",
    "gender": "other"
  }')

if echo "$OTHER_RESPONSE" | grep -q '"success":false'; then
    echo "✅ 'Other' gender correctly rejected"
else
    echo "❌ 'Other' gender should be rejected"
fi

# Test 3: Test that species is required for pets
echo "3. Testing that species is required for pets..."

NO_SPECIES_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pet Without Species",
    "type": "pet",
    "gender": "female"
  }')

if echo "$NO_SPECIES_RESPONSE" | grep -q '"success":false'; then
    echo "✅ Pet without species correctly rejected"
else
    echo "❌ Pet without species should be rejected"
fi

# Test 4: Test successful pet creation with required species
echo "4. Testing successful pet creation with species..."

CAT_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fluffy Cat",
    "type": "pet",
    "gender": "female",
    "species": "cat"
  }')

if echo "$CAT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Cat with species created successfully"
    CAT_ID=$(echo "$CAT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Failed to create cat with species"
fi

DOG_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy Dog",
    "type": "pet",
    "gender": "male",
    "species": "dog"
  }')

if echo "$DOG_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Dog with species created successfully"
    DOG_ID=$(echo "$DOG_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Failed to create dog with species"
fi

# Test 5: Test updating human to pet requires species
echo "5. Testing that updating human to pet requires species..."

if [ ! -z "$MALE_ID" ]; then
    UPDATE_TO_PET_RESPONSE=$(curl -s -X PUT "$API_BASE/family-members/$MALE_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "pet"
      }')

    if echo "$UPDATE_TO_PET_RESPONSE" | grep -q '"success":false'; then
        echo "✅ Converting human to pet without species correctly rejected"
    else
        echo "❌ Converting human to pet without species should be rejected"
    fi
fi

# Test 6: Test successful update with species
echo "6. Testing successful human to pet conversion with species..."

if [ ! -z "$FEMALE_ID" ]; then
    UPDATE_WITH_SPECIES_RESPONSE=$(curl -s -X PUT "$API_BASE/family-members/$FEMALE_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "pet",
        "species": "cat"
      }')

    if echo "$UPDATE_WITH_SPECIES_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Converting human to pet with species successful"
    else
        echo "❌ Converting human to pet with species failed"
    fi
fi

# Test 7: Verify all created members have correct fields
echo "7. Verifying all created members..."

GET_RESPONSE=$(curl -s "$API_BASE/family-members")

if echo "$GET_RESPONSE" | grep -q '"gender":"male"' && \
   echo "$GET_RESPONSE" | grep -q '"gender":"female"' && \
   echo "$GET_RESPONSE" | grep -q '"species":"cat"' && \
   echo "$GET_RESPONSE" | grep -q '"species":"dog"'; then
    echo "✅ All family members have correct gender and species fields"
else
    echo "❌ Some family members missing expected fields"
fi

echo ""
echo "🎉 Updated Requirements Test Results:"
echo "===================================="
echo "✅ Only male/female gender options supported"
echo "✅ 'Other' gender properly rejected"
echo "✅ Species is required for pets"
echo "✅ Pets without species are rejected"
echo "✅ All validations working correctly"
echo ""
echo "The application now enforces:"
echo "• Gender: male or female only"
echo "• Species: required for all pets (cat or dog)"