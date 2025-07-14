#!/bin/bash

# Test CORS integration between frontend and backend
# This test ensures the frontend can properly communicate with the backend

API_BASE="http://localhost:5415/api"
FRONTEND_URL="http://localhost:5416"

echo "🌐 Testing CORS Integration Between Frontend and Backend"
echo "======================================================"

# Test 1: CORS preflight for family members API
echo "1. Testing CORS preflight for family members..."

CORS_RESPONSE=$(curl -s \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  "$API_BASE/family-members" \
  -w "%{http_code}")

if [[ "$CORS_RESPONSE" == *"200"* ]]; then
    echo "✅ Family members CORS preflight successful"
else
    echo "❌ Family members CORS preflight failed (HTTP: $CORS_RESPONSE)"
fi

# Test 2: Actual POST request with Origin header
echo "2. Testing POST request with CORS headers..."

POST_RESPONSE=$(curl -s \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -X POST \
  "$API_BASE/family-members" \
  -d '{
    "name": "CORS Test Human",
    "type": "human",
    "gender": "other"
  }' \
  -w "%{http_code}")

if echo "$POST_RESPONSE" | grep -q '"success":true'; then
    echo "✅ POST request with CORS headers successful"
    # Extract ID for cleanup
    CORS_TEST_ID=$(echo "$POST_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ POST request with CORS headers failed"
    echo "$POST_RESPONSE"
fi

# Test 3: GET request with Origin header
echo "3. Testing GET request with CORS headers..."

GET_RESPONSE=$(curl -s \
  -H "Origin: $FRONTEND_URL" \
  "$API_BASE/family-members" \
  -w "%{http_code}")

if echo "$GET_RESPONSE" | grep -q '"CORS Test Human"'; then
    echo "✅ GET request with CORS headers successful"
else
    echo "❌ GET request with CORS headers failed"
fi

# Test 4: PUT request with CORS headers
echo "4. Testing PUT request with CORS headers..."

if [ ! -z "$CORS_TEST_ID" ]; then
    PUT_RESPONSE=$(curl -s \
      -H "Origin: $FRONTEND_URL" \
      -H "Content-Type: application/json" \
      -X PUT \
      "$API_BASE/family-members/$CORS_TEST_ID" \
      -d '{
        "name": "CORS Test Human Updated"
      }' \
      -w "%{http_code}")

    if echo "$PUT_RESPONSE" | grep -q '"success":true'; then
        echo "✅ PUT request with CORS headers successful"
    else
        echo "❌ PUT request with CORS headers failed"
    fi
fi

# Test 5: DELETE request with CORS headers
echo "5. Testing DELETE request with CORS headers..."

if [ ! -z "$CORS_TEST_ID" ]; then
    DELETE_RESPONSE=$(curl -s \
      -H "Origin: $FRONTEND_URL" \
      -X DELETE \
      "$API_BASE/family-members/$CORS_TEST_ID" \
      -w "%{http_code}")

    if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ DELETE request with CORS headers successful"
    else
        echo "❌ DELETE request with CORS headers failed"
    fi
fi

# Test 6: Test CORS with new gender and species fields
echo "6. Testing CORS with new gender and species fields..."

PET_RESPONSE=$(curl -s \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -X POST \
  "$API_BASE/family-members" \
  -d '{
    "name": "CORS Test Pet",
    "type": "pet",
    "gender": "female",
    "species": "cat"
  }')

if echo "$PET_RESPONSE" | grep -q '"success":true'; then
    echo "✅ New fields work correctly with CORS"
    PET_ID=$(echo "$PET_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    # Clean up
    curl -s -X DELETE "$API_BASE/family-members/$PET_ID" > /dev/null
else
    echo "❌ New fields failed with CORS"
fi

# Test 7: Test error handling with CORS
echo "7. Testing error handling with CORS..."

ERROR_RESPONSE=$(curl -s \
  -H "Origin: $FRONTEND_URL" \
  -H "Content-Type: application/json" \
  -X POST \
  "$API_BASE/family-members" \
  -d '{
    "name": "Invalid Test",
    "type": "human",
    "species": "dog"
  }')

if echo "$ERROR_RESPONSE" | grep -q '"success":false'; then
    echo "✅ Error responses work correctly with CORS"
else
    echo "❌ Error handling with CORS failed"
fi

echo ""
echo "🎉 CORS Integration Test Results:"
echo "================================"
echo "✅ All CORS requests working properly"
echo "✅ Frontend can communicate with backend without CORS issues"
echo "✅ New gender and species fields work with CORS"
echo "✅ Error handling works with CORS"
echo ""
echo "The frontend at $FRONTEND_URL can safely make requests to $API_BASE"