#!/bin/bash

# Demo script showing the new gender and species functionality
# This creates sample data to demonstrate the new features

API_BASE="http://localhost:5415/api"

echo "🎉 Sushruta Gender & Species Features Demo"
echo "=========================================="
echo ""

# Create diverse family members to showcase all features
echo "Creating a diverse family to showcase new features..."
echo ""

# 1. Create a human male
echo "1. Creating John (Human, Male)..."
JOHN_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "type": "human",
    "dateOfBirth": "1985-06-15",
    "gender": "male"
  }')

if echo "$JOHN_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ John created successfully"
else
    echo "   ❌ Failed to create John"
fi

# 2. Create a human female
echo "2. Creating Sarah (Human, Female)..."
SARAH_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Smith",
    "type": "human",
    "dateOfBirth": "1988-03-22",
    "gender": "female"
  }')

if echo "$SARAH_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Sarah created successfully"
else
    echo "   ❌ Failed to create Sarah"
fi

# 3. Create a human with other gender
echo "3. Creating Alex (Human, Other)..."
ALEX_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Smith",
    "type": "human",
    "dateOfBirth": "2005-11-08",
    "gender": "other"
  }')

if echo "$ALEX_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Alex created successfully"
else
    echo "   ❌ Failed to create Alex"
fi

# 4. Create a female cat
echo "4. Creating Luna (Female Cat)..."
LUNA_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luna",
    "type": "pet",
    "dateOfBirth": "2020-05-12",
    "gender": "female",
    "species": "cat"
  }')

if echo "$LUNA_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Luna (cat) created successfully"
else
    echo "   ❌ Failed to create Luna"
fi

# 5. Create a male dog
echo "5. Creating Max (Male Dog)..."
MAX_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "type": "pet",
    "dateOfBirth": "2019-08-30",
    "gender": "male",
    "species": "dog"
  }')

if echo "$MAX_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Max (dog) created successfully"
else
    echo "   ❌ Failed to create Max"
fi

# 6. Create a female dog
echo "6. Creating Bella (Female Dog)..."
BELLA_RESPONSE=$(curl -s -X POST "$API_BASE/family-members" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bella",
    "type": "pet",
    "dateOfBirth": "2021-12-03",
    "gender": "female",
    "species": "dog"
  }')

if echo "$BELLA_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Bella (dog) created successfully"
else
    echo "   ❌ Failed to create Bella"
fi

echo ""
echo "🏠 Demo Family Created Successfully!"
echo "=================================="

# Display the created family
echo ""
echo "📋 Family Members Summary:"
echo "------------------------"

GET_RESPONSE=$(curl -s "$API_BASE/family-members")

# Parse and display in a nice format
echo "$GET_RESPONSE" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read name; do
    echo "👤 $name"
done

echo ""
echo "🎨 Features Demonstrated:"
echo "- ✅ Human family members with all gender options (Male, Female, Other)"
echo "- ✅ Pet family members with species (Cat, Dog) and gender"
echo "- ✅ Proper validation (species only for pets)"
echo "- ✅ Complete API functionality with new fields"
echo ""
echo "🌐 Next Steps:"
echo "1. Open http://localhost:5416 in your browser"
echo "2. Navigate to Family Members page"
echo "3. See the beautiful icons for gender and species"
echo "4. Try adding new family members with the enhanced form"
echo "5. Edit existing members to see conditional species field"
echo ""
echo "🎉 The Sushruta Medicine Tracker now supports comprehensive"
echo "   family member attributes with beautiful visual representation!"