package main

import (
	"encoding/json"
	"flag"
	"html/template"
	"log"
	"math/rand"
	"net/http"

	"github.com/gorilla/mux"
)

const (
	HIGH_TRAFFIC   uint64 = 3
	MEDIUM_TRAFFIC uint64 = 2
	LOW_TRAFFIC    uint64 = 1
)

var (
	RunMode   string
	templates *template.Template
	levels    = [3]uint64{HIGH_TRAFFIC, MEDIUM_TRAFFIC, LOW_TRAFFIC}
)

type trafficResponse struct {
	Level uint64 `json:"level"`
}

func initTmpl() {
	templatePaths := []string{
		"views/header.html",
		"views/footer.html",
		"views/react.html",
	}

	templates = template.Must(template.New("").ParseFiles(templatePaths...))
	log.Println(templates.DefinedTemplates())
}

func renderJson(w http.ResponseWriter, resp interface{}) {
	err := json.NewEncoder(w).Encode(resp)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func renderTemplate(w http.ResponseWriter, tmpl string, renderArgs map[string]interface{}) {
	renderArgs["runMode"] = RunMode
	err := templates.ExecuteTemplate(w, tmpl+".html", renderArgs)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func Traffic(w http.ResponseWriter, r *http.Request) {
	renderJson(w, trafficResponse{
		Level: levels[rand.Intn(3)],
	})

}

func Index(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "react", map[string]interface{}{
		"title": "Xen Traffic",
	})
}

func init() {
	runMode := flag.String("runMode", "prod", "prod or dev")
	flag.Parse()

	RunMode = *runMode
	log.Printf("running in %s \n", RunMode)

	initTmpl()
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/xen/traffic", Traffic).Methods("GET")
	r.HandleFunc("/", Index)

	s := http.StripPrefix("/assets/", http.FileServer(http.Dir("./assets/")))
	r.PathPrefix("/assets/").Handler(s)

	http.ListenAndServe(":9005", r)
}
