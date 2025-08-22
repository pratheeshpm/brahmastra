    def _parse_json_response(self, response: str) -> Dict[str, str]:
        """Parse JSON response from AI"""
        result = {}
        
        print(f"🔍 Parsing AI response ({len(response)} chars)")
        
        try:
            # Try to parse as JSON first
            import json
            
            # Clean up response - sometimes AI adds extra text before/after JSON
            response_clean = response.strip()
            
            # Find JSON block
            json_start = response_clean.find('{')
            json_end = response_clean.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_clean[json_start:json_end]
                print(f"🔍 Found JSON block: {json_str[:200]}...")
                
                parsed_json = json.loads(json_str)
                
                # Extract fields from JSON
                result['optimized_solution'] = parsed_json.get('optimized_solution', '').strip()
                result['explanation'] = parsed_json.get('explanation', '').strip()
                result['complexity_analysis'] = parsed_json.get('complexity_analysis', '').strip()
                result['brute_force_approach'] = parsed_json.get('brute_force_approach', '').strip()
                result['test_cases_covered'] = str(parsed_json.get('test_cases', [])).strip()
                
                print(f"✅ JSON parsing successful!")
                print(f"📝 Solution length: {len(result.get('optimized_solution', ''))}")
                
                return result
                
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing failed: {e}")
            print("🔄 Falling back to text extraction...")
        except Exception as e:
            print(f"⚠️ JSON parsing error: {e}")
            print("🔄 Falling back to text extraction...")
        
        # Fallback: Try to extract from markdown-style response
        print("🔄 Trying balanced brace extraction as fallback...")
        balanced_code = self._extract_function_with_balanced_braces(response)
        if balanced_code:
            print(f"✅ Balanced brace extraction successful: {len(balanced_code)} chars")
            result['optimized_solution'] = balanced_code
        
        # If still no solution, try manual extraction
        if not result.get('optimized_solution'):
            print("🔄 Trying manual line-by-line extraction...")
            extracted_code = self._extract_function_manually(response)
            if extracted_code:
                print(f"✅ Manual extraction successful: {len(extracted_code)} chars")
                result['optimized_solution'] = extracted_code
        
        # Extract other components with simple text patterns as fallback
        if not result.get('explanation'):
            explanation_match = re.search(r'explanation["\s:]*([^"}\n]+)', response, re.IGNORECASE)
            if explanation_match:
                result['explanation'] = explanation_match.group(1).strip()
        
        return result
