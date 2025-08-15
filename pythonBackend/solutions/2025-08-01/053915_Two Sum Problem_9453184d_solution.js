// Two Sum Problem
// Generated on: 2025-08-01T05:39:15.396015
// Input type: text
// Success: True
// Complexity: Time Complexity: O(n), Space Complexity: O(n)...

function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}