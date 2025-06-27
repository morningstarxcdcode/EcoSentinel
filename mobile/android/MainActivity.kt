/**
 * EcoSentinel Android App
 * Native Android application for environmental monitoring
 * Created by: morningstarxcdcode
 */

package com.morningstarxcdcode.ecosentinel

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.google.android.gms.location.*
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

class MainActivity : ComponentActivity() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var environmentalViewModel: EnvironmentalViewModel

    private val locationPermissionRequest = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        when {
            permissions.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false) -> {
                // Precise location access granted
                getCurrentLocation()
            }
            permissions.getOrDefault(Manifest.permission.ACCESS_COARSE_LOCATION, false) -> {
                // Only approximate location access granted
                getCurrentLocation()
            }
            else -> {
                // No location access granted
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        environmentalViewModel = EnvironmentalViewModel()
        
        // Request location permissions
        requestLocationPermissions()
        
        setContent {
            EcoSentinelTheme {
                EcoSentinelApp(environmentalViewModel)
            }
        }
    }

    private fun requestLocationPermissions() {
        locationPermissionRequest.launch(arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ))
    }

    private fun getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                location?.let {
                    environmentalViewModel.updateLocation(it.latitude, it.longitude)
                }
            }
    }
}

@Composable
fun EcoSentinelApp(viewModel: EnvironmentalViewModel = viewModel()) {
    val navController = rememberNavController()
    
    NavHost(navController = navController, startDestination = "dashboard") {
        composable("dashboard") { DashboardScreen(navController, viewModel) }
        composable("map") { MapScreen(navController, viewModel) }
        composable("predictions") { PredictionsScreen(navController, viewModel) }
        composable("alerts") { AlertsScreen(navController, viewModel) }
        composable("settings") { SettingsScreen(navController, viewModel) }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(navController: NavController, viewModel: EnvironmentalViewModel) {
    val environmentalData by viewModel.environmentalData.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.refreshData()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("EcoSentinel") },
                actions = {
                    IconButton(onClick = { viewModel.refreshData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        bottomBar = {
            BottomNavigationBar(navController)
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                LocationCard(environmentalData.location)
            }
            
            item {
                OverallScoreCard(environmentalData.overallScore)
            }
            
            item {
                AirQualityCard(environmentalData.airQuality)
            }
            
            item {
                WeatherMetricsGrid(environmentalData)
            }
            
            item {
                HealthRecommendationsCard(environmentalData.healthRecommendations)
            }
            
            if (environmentalData.alerts.isNotEmpty()) {
                item {
                    AlertsCard(environmentalData.alerts)
                }
            }
        }
    }
}

@Composable
fun LocationCard(location: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.LocationOn,
                contentDescription = "Location",
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = location,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Last updated: ${getCurrentTime()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun OverallScoreCard(score: Int) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Environmental Score",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Box(
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    progress = score / 100f,
                    modifier = Modifier.size(120.dp),
                    strokeWidth = 8.dp,
                    color = getScoreColor(score)
                )
                Text(
                    text = "$score",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    color = getScoreColor(score)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = getScoreDescription(score),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun AirQualityCard(airQuality: AirQualityData) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = airQuality.color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Air Quality Index",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${airQuality.value} AQI",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = airQuality.color
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LinearProgressIndicator(
                progress = airQuality.value / 500f,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = airQuality.color,
                trackColor = airQuality.color.copy(alpha = 0.3f)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = airQuality.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            if (airQuality.advice.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = airQuality.advice,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
fun WeatherMetricsGrid(data: EnvironmentalData) {
    Column {
        Text(
            text = "Environmental Metrics",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "Temperature",
                value = "${data.temperature}°C",
                icon = Icons.Default.Thermostat,
                color = Color(0xFFFF6B35),
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                title = "Humidity",
                value = "${data.humidity}%",
                icon = Icons.Default.Water,
                color = Color(0xFF2196F3),
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "UV Index",
                value = "${data.uvIndex}",
                icon = Icons.Default.WbSunny,
                color = Color(0xFFFFC107),
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                title = "Wind Speed",
                value = "${data.windSpeed} km/h",
                icon = Icons.Default.Air,
                color = Color(0xFF4CAF50),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun HealthRecommendationsCard(recommendations: List<String>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Health Recommendations",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            recommendations.forEach { recommendation ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Lightbulb,
                        contentDescription = "Tip",
                        tint = Color(0xFFFFC107),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = recommendation,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@Composable
fun AlertsCard(alerts: List<String>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFFFEBEE)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Warning,
                    contentDescription = "Alert",
                    tint = Color(0xFFD32F2F)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Environmental Alerts",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFD32F2F)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            alerts.forEach { alert ->
                Text(
                    text = "• $alert",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavController) {
    NavigationBar {
        val items = listOf(
            BottomNavItem("dashboard", "Dashboard", Icons.Default.Dashboard),
            BottomNavItem("map", "Map", Icons.Default.Map),
            BottomNavItem("predictions", "AI Insights", Icons.Default.Psychology),
            BottomNavItem("alerts", "Alerts", Icons.Default.Notifications),
            BottomNavItem("settings", "Settings", Icons.Default.Settings)
        )
        
        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                selected = false, // You would track current route here
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(navController.graph.startDestinationId)
                        launchSingleTop = true
                    }
                }
            )
        }
    }
}

// Placeholder screens
@Composable
fun MapScreen(navController: NavController, viewModel: EnvironmentalViewModel) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Environmental Map") })
        },
        bottomBar = {
            BottomNavigationBar(navController)
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Text("Environmental Map Coming Soon")
        }
    }
}

@Composable
fun PredictionsScreen(navController: NavController, viewModel: EnvironmentalViewModel) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("AI Insights") })
        },
        bottomBar = {
            BottomNavigationBar(navController)
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Text("AI Predictions Coming Soon")
        }
    }
}

@Composable
fun AlertsScreen(navController: NavController, viewModel: EnvironmentalViewModel) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Environmental Alerts") })
        },
        bottomBar = {
            BottomNavigationBar(navController)
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Text("Environmental Alerts Coming Soon")
        }
    }
}

@Composable
fun SettingsScreen(navController: NavController, viewModel: EnvironmentalViewModel) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Settings") })
        },
        bottomBar = {
            BottomNavigationBar(navController)
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Text("Settings Coming Soon")
        }
    }
}

// Data classes
data class EnvironmentalData(
    val location: String = "San Francisco",
    val overallScore: Int = 78,
    val airQuality: AirQualityData = AirQualityData(),
    val temperature: Int = 22,
    val humidity: Int = 65,
    val uvIndex: Int = 6,
    val windSpeed: Int = 12,
    val healthRecommendations: List<String> = listOf(
        "Good time for outdoor activities",
        "Stay hydrated",
        "Use sunscreen if going outside"
    ),
    val alerts: List<String> = emptyList()
)

data class AirQualityData(
    val value: Int = 75,
    val description: String = "Moderate",
    val advice: String = "Sensitive individuals should limit outdoor activities",
    val color: Color = Color(0xFFFFC107)
)

data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

// ViewModel
class EnvironmentalViewModel : ViewModel() {
    private val _environmentalData = MutableStateFlow(EnvironmentalData())
    val environmentalData: StateFlow<EnvironmentalData> = _environmentalData.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val apiService = createApiService()
    
    fun updateLocation(latitude: Double, longitude: Double) {
        // Update location and fetch new data
        refreshData()
    }
    
    fun refreshData() {
        // In a real app, this would call the EcoSentinel API
        // For now, simulate with random data
        _isLoading.value = true
        
        // Simulate API call delay
        kotlinx.coroutines.GlobalScope.launch {
            kotlinx.coroutines.delay(1000)
            
            _environmentalData.value = EnvironmentalData(
                overallScore = (60..90).random(),
                airQuality = AirQualityData(
                    value = (50..150).random(),
                    description = "Moderate",
                    advice = "Limit prolonged outdoor activities"
                ),
                temperature = (15..30).random(),
                humidity = (40..80).random()
            )
            
            _isLoading.value = false
        }
    }
    
    private fun createApiService(): EcoSentinelApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.ecosentinel.com/v1/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(EcoSentinelApiService::class.java)
    }
}

// API Service
interface EcoSentinelApiService {
    @GET("environmental-data")
    suspend fun getEnvironmentalData(
        @Query("location") location: String
    ): EnvironmentalData
    
    @GET("ai-insights/predictions")
    suspend fun getAIPredictions(
        @Query("location") location: String
    ): Any
}

// Theme
@Composable
fun EcoSentinelTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF4CAF50),
            secondary = Color(0xFF2196F3),
            background = Color(0xFFF5F5F5)
        ),
        content = content
    )
}

// Helper functions
fun getScoreColor(score: Int): Color {
    return when {
        score >= 80 -> Color(0xFF4CAF50) // Green
        score >= 60 -> Color(0xFFFFC107) // Yellow
        score >= 40 -> Color(0xFFFF9800) // Orange
        else -> Color(0xFFD32F2F) // Red
    }
}

fun getScoreDescription(score: Int): String {
    return when {
        score >= 80 -> "Excellent environmental conditions"
        score >= 60 -> "Good environmental conditions"
        score >= 40 -> "Moderate environmental conditions"
        else -> "Poor environmental conditions"
    }
}

fun getCurrentTime(): String {
    return java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
        .format(java.util.Date())
}
