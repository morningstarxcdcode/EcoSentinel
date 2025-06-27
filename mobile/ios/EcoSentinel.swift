/**
 * EcoSentinel iOS App
 * Native iOS application for environmental monitoring
 * Created by: morningstarxcdcode
 */

import SwiftUI
import CoreLocation
import UserNotifications
import Combine

@main
struct EcoSentinelApp: App {
    @StateObject private var environmentalData = EnvironmentalDataManager()
    @StateObject private var locationManager = LocationManager()
    @StateObject private var notificationManager = NotificationManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(environmentalData)
                .environmentObject(locationManager)
                .environmentObject(notificationManager)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        // Request location permissions
        locationManager.requestLocationPermission()
        
        // Request notification permissions
        notificationManager.requestNotificationPermission()
        
        // Start environmental data monitoring
        environmentalData.startMonitoring()
    }
}

// MARK: - Main Content View
struct ContentView: View {
    @EnvironmentObject var environmentalData: EnvironmentalDataManager
    @EnvironmentObject var locationManager: LocationManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Dashboard Tab
            DashboardView()
                .tabItem {
                    Image(systemName: "gauge")
                    Text("Dashboard")
                }
                .tag(0)
            
            // Map Tab
            MapView()
                .tabItem {
                    Image(systemName: "map")
                    Text("Map")
                }
                .tag(1)
            
            // Predictions Tab
            PredictionsView()
                .tabItem {
                    Image(systemName: "brain.head.profile")
                    Text("AI Insights")
                }
                .tag(2)
            
            // Alerts Tab
            AlertsView()
                .tabItem {
                    Image(systemName: "bell")
                    Text("Alerts")
                }
                .tag(3)
            
            // Settings Tab
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(4)
        }
        .accentColor(.green)
    }
}

// MARK: - Dashboard View
struct DashboardView: View {
    @EnvironmentObject var environmentalData: EnvironmentalDataManager
    @EnvironmentObject var locationManager: LocationManager
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Location Header
                    LocationHeaderView()
                    
                    // Current Conditions
                    CurrentConditionsView()
                    
                    // Air Quality Card
                    AirQualityCardView()
                    
                    // Weather Metrics
                    WeatherMetricsView()
                    
                    // Health Recommendations
                    HealthRecommendationsView()
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("EcoSentinel")
            .refreshable {
                await environmentalData.refreshData()
            }
        }
    }
}

// MARK: - Location Header
struct LocationHeaderView: View {
    @EnvironmentObject var locationManager: LocationManager
    
    var body: some View {
        HStack {
            Image(systemName: "location.fill")
                .foregroundColor(.green)
            
            VStack(alignment: .leading) {
                Text(locationManager.currentLocation?.city ?? "Unknown Location")
                    .font(.headline)
                
                Text("Last updated: \(Date().formatted(.dateTime.hour().minute()))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button(action: {
                locationManager.updateLocation()
            }) {
                Image(systemName: "arrow.clockwise")
                    .foregroundColor(.green)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Current Conditions
struct CurrentConditionsView: View {
    @EnvironmentObject var environmentalData: EnvironmentalDataManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Current Conditions")
                .font(.title2)
                .fontWeight(.semibold)
            
            HStack(spacing: 20) {
                // Overall Score
                VStack {
                    ZStack {
                        Circle()
                            .stroke(Color.green.opacity(0.3), lineWidth: 8)
                            .frame(width: 80, height: 80)
                        
                        Circle()
                            .trim(from: 0, to: CGFloat(environmentalData.overallScore) / 100)
                            .stroke(Color.green, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                            .frame(width: 80, height: 80)
                            .rotationEffect(.degrees(-90))
                        
                        Text("\(Int(environmentalData.overallScore))")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    
                    Text("Overall Score")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Status Indicators
                VStack(alignment: .leading, spacing: 8) {
                    StatusIndicator(
                        title: "Air Quality",
                        value: environmentalData.airQuality.description,
                        color: environmentalData.airQuality.color
                    )
                    
                    StatusIndicator(
                        title: "Temperature",
                        value: "\(Int(environmentalData.temperature))°C",
                        color: .blue
                    )
                    
                    StatusIndicator(
                        title: "Humidity",
                        value: "\(Int(environmentalData.humidity))%",
                        color: .cyan
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(radius: 2)
    }
}

// MARK: - Status Indicator
struct StatusIndicator: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.caption)
                .fontWeight(.medium)
        }
    }
}

// MARK: - Air Quality Card
struct AirQualityCardView: View {
    @EnvironmentObject var environmentalData: EnvironmentalDataManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Air Quality Index")
                    .font(.headline)
                
                Spacer()
                
                Text("\(Int(environmentalData.airQuality.value)) AQI")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(environmentalData.airQuality.color)
            }
            
            // AQI Progress Bar
            ProgressView(value: environmentalData.airQuality.value, total: 500)
                .progressViewStyle(LinearProgressViewStyle(tint: environmentalData.airQuality.color))
                .scaleEffect(x: 1, y: 2, anchor: .center)
            
            Text(environmentalData.airQuality.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            // Health Advice
            if !environmentalData.airQuality.advice.isEmpty {
                Text(environmentalData.airQuality.advice)
                    .font(.caption)
                    .padding(.top, 4)
                    .foregroundColor(.primary)
            }
        }
        .padding()
        .background(environmentalData.airQuality.color.opacity(0.1))
        .cornerRadius(16)
    }
}

// MARK: - Weather Metrics
struct WeatherMetricsView: View {
    @EnvironmentObject var environmentalData: EnvironmentalDataManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Environmental Metrics")
                .font(.headline)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                MetricCard(
                    title: "UV Index",
                    value: "\(Int(environmentalData.uvIndex))",
                    icon: "sun.max.fill",
                    color: .orange
                )
                
                MetricCard(
                    title: "Pressure",
                    value: "\(Int(environmentalData.pressure)) hPa",
                    icon: "barometer",
                    color: .purple
                )
                
                MetricCard(
                    title: "Wind Speed",
                    value: "\(Int(environmentalData.windSpeed)) km/h",
                    icon: "wind",
                    color: .gray
                )
                
                MetricCard(
                    title: "Visibility",
                    value: "\(Int(environmentalData.visibility)) km",
                    icon: "eye.fill",
                    color: .blue
                )
            }
        }
    }
}

// MARK: - Metric Card
struct MetricCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Health Recommendations
struct HealthRecommendationsView: View {
    @EnvironmentObject var environmentalData: EnvironmentalDataManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Health Recommendations")
                .font(.headline)
            
            ForEach(environmentalData.healthRecommendations, id: \.self) { recommendation in
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundColor(.yellow)
                    
                    Text(recommendation)
                        .font(.subheadline)
                    
                    Spacer()
                }
                .padding(.vertical, 4)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
}

// MARK: - Data Models
struct AirQualityData {
    let value: Double
    let description: String
    let advice: String
    
    var color: Color {
        switch value {
        case 0...50: return .green
        case 51...100: return .yellow
        case 101...150: return .orange
        case 151...200: return .red
        default: return .purple
        }
    }
}

struct LocationData {
    let city: String
    let country: String
    let latitude: Double
    let longitude: Double
}

// MARK: - Environmental Data Manager
class EnvironmentalDataManager: ObservableObject {
    @Published var airQuality = AirQualityData(value: 75, description: "Moderate", advice: "Sensitive individuals should limit outdoor activities")
    @Published var temperature: Double = 22.5
    @Published var humidity: Double = 65
    @Published var pressure: Double = 1013
    @Published var uvIndex: Double = 6
    @Published var windSpeed: Double = 12
    @Published var visibility: Double = 10
    @Published var overallScore: Double = 78
    @Published var healthRecommendations = [
        "Good time for outdoor activities",
        "Stay hydrated",
        "Use sunscreen if going outside"
    ]
    
    private var cancellables = Set<AnyCancellable>()
    
    func startMonitoring() {
        // Start periodic data updates
        Timer.publish(every: 300, on: .main, in: .common) // Every 5 minutes
            .autoconnect()
            .sink { _ in
                Task {
                    await self.fetchEnvironmentalData()
                }
            }
            .store(in: &cancellables)
        
        // Initial data fetch
        Task {
            await fetchEnvironmentalData()
        }
    }
    
    @MainActor
    func refreshData() async {
        await fetchEnvironmentalData()
    }
    
    private func fetchEnvironmentalData() async {
        // Implementation would call EcoSentinel API
        print("🌍 Fetching environmental data...")
        
        // Simulate API call
        try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
        
        // Update data (in real app, this would come from API)
        DispatchQueue.main.async {
            self.airQuality = AirQualityData(
                value: Double.random(in: 50...150),
                description: "Moderate",
                advice: "Limit prolonged outdoor activities"
            )
            self.temperature = Double.random(in: 15...30)
            self.humidity = Double.random(in: 40...80)
            self.overallScore = Double.random(in: 60...90)
        }
    }
}

// MARK: - Location Manager
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var currentLocation: LocationData?
    private let locationManager = CLLocationManager()
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func requestLocationPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func updateLocation() {
        locationManager.requestLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else { return }
        
        // Reverse geocoding to get city name
        let geocoder = CLGeocoder()
        geocoder.reverseGeocodeLocation(location) { placemarks, error in
            if let placemark = placemarks?.first {
                DispatchQueue.main.async {
                    self.currentLocation = LocationData(
                        city: placemark.locality ?? "Unknown",
                        country: placemark.country ?? "Unknown",
                        latitude: location.coordinate.latitude,
                        longitude: location.coordinate.longitude
                    )
                }
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("❌ Location error: \(error.localizedDescription)")
    }
}

// MARK: - Notification Manager
class NotificationManager: ObservableObject {
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                print("✅ Notification permission granted")
            } else {
                print("❌ Notification permission denied")
            }
        }
    }
    
    func sendEnvironmentalAlert(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        )
        
        UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - Additional Views (Placeholders)
struct MapView: View {
    var body: some View {
        NavigationView {
            Text("Environmental Map")
                .navigationTitle("Map")
        }
    }
}

struct PredictionsView: View {
    var body: some View {
        NavigationView {
            Text("AI Predictions")
                .navigationTitle("AI Insights")
        }
    }
}

struct AlertsView: View {
    var body: some View {
        NavigationView {
            Text("Environmental Alerts")
                .navigationTitle("Alerts")
        }
    }
}

struct SettingsView: View {
    var body: some View {
        NavigationView {
            Text("Settings")
                .navigationTitle("Settings")
        }
    }
}
