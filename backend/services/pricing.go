package services

import (
	"strings"
)

const (
	PricePerWord     = 20.0  // Rs. 20 per word
	MinCost          = 200.0 // Minimum Rs. 200
	PremiumMultiplier = 2.0  // Premium ads cost 2x
)

// CalculatePrice computes ad cost based on word count and premium status
func CalculatePrice(description string, isPremium bool) (wordCount int, totalCost float64) {
	// Clean and count words
	cleaned := strings.TrimSpace(description)
	if cleaned == "" {
		return 0, MinCost
	}

	words := strings.Fields(cleaned)
	wordCount = len(words)

	// Calculate base cost
	totalCost = float64(wordCount) * PricePerWord

	// Apply minimum
	if totalCost < MinCost {
		totalCost = MinCost
	}

	// Premium multiplier
	if isPremium {
		totalCost *= PremiumMultiplier
	}

	return wordCount, totalCost
}

// GetPricingInfo returns pricing breakdown for frontend display
func GetPricingInfo(wordCount int, isPremium bool) map[string]interface{} {
	baseCost := float64(wordCount) * PricePerWord
	if baseCost < MinCost {
		baseCost = MinCost
	}

	premiumMultiplier := 1.0
	if isPremium {
		premiumMultiplier = PremiumMultiplier
	}

	totalCost := baseCost * premiumMultiplier

	return map[string]interface{}{
		"word_count":         wordCount,
		"price_per_word":     PricePerWord,
		"base_cost":          baseCost,
		"minimum_cost":       MinCost,
		"is_premium":         isPremium,
		"premium_multiplier": premiumMultiplier,
		"total_cost":         totalCost,
	}
}